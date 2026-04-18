<?php
/**
 * Login wall + registration flow. Allowlist-driven redirect to /login with
 * ?redirect= for any gated route when the user is anonymous. Registration
 * enforces research context, state, and all 3 compliance checkboxes.
 *
 * @package AmidaCompliance
 */

defined( 'ABSPATH' ) || exit;

class Amida_Login_Gate {

	/**
	 * Public routes that bypass the login wall (paths only — prefix match with
	 * trailing slash semantics).
	 */
	public const ALLOWLIST = [
		'/',
		'/about',
		'/contact',
		'/login',
		'/register',
		'/forgot-password',
		'/reset-password',
		'/age-verification',
		'/ruo-policy',
		'/terms',
		'/privacy',
		'/refund-policy',
		'/shipping-policy',
		'/disclaimer',
		'/age-verification-policy',
		'/manifest.json',
		'/sw.js',
		'/offline',
		'/robots.txt',
		'/sitemap_index.xml',
	];

	public static function init(): void {
		add_action( 'template_redirect',        [ __CLASS__, 'enforce' ], 0 );
		add_action( 'login_form_register',      [ __CLASS__, 'validate_registration' ], 5 );
		add_action( 'user_register',            [ __CLASS__, 'on_register' ], 10, 1 );
		add_action( 'wp_login',                 [ __CLASS__, 'on_login' ], 10, 2 );
		add_filter( 'registration_errors',      [ __CLASS__, 'registration_errors' ], 10, 3 );
		add_action( 'login_form_registration',  [ __CLASS__, 'intercept_wp_login_register' ] );
		add_action( 'wp_logout',                [ __CLASS__, 'on_logout' ] );
	}

	/**
	 * Redirect anonymous visitors to /login?redirect=... unless they're on an
	 * allowlisted path. Assumes amida_age_verified cookie has been set
	 * (otherwise the age gate modal is already rendering).
	 */
	public static function enforce(): void {
		if ( is_user_logged_in() ) {
			return;
		}

		$path = untrailingslashit( (string) wp_parse_url( $_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH ) );
		if ( '' === $path ) { $path = '/'; }

		foreach ( self::ALLOWLIST as $allow ) {
			if ( $path === $allow || str_starts_with( $path, $allow . '/' ) ) {
				return;
			}
		}

		// Assets always pass through.
		if ( preg_match( '#\\.(css|js|png|jpe?g|gif|webp|svg|woff2?|ttf|ico|map)$#i', $path ) ) {
			return;
		}

		$redirect = add_query_arg( 'redirect', rawurlencode( $_SERVER['REQUEST_URI'] ?? '/' ), home_url( '/login' ) );
		wp_safe_redirect( $redirect, 302 );
		exit;
	}

	/**
	 * Validate the Amida registration fields before WP creates the user.
	 */
	public static function registration_errors( WP_Error $errors, string $login, string $email ): WP_Error {
		$required = [
			'amida_agree_ruo'      => __( 'You must agree to the Research Use Only policy.', 'amida-compliance' ),
			'amida_agree_policies' => __( 'You must accept the site policies.', 'amida-compliance' ),
			'amida_agree_age'      => sprintf( __( 'You must certify you are %d or older.', 'amida-compliance' ), (int) AMIDA_MIN_AGE ),
		];

		foreach ( $required as $field => $message ) {
			if ( empty( $_POST[ $field ] ) ) {
				$errors->add( 'amida_' . $field, $message );
			}
		}

		if ( empty( $_POST['amida_research_context'] ) ) {
			$errors->add( 'amida_research_context', __( 'Please select a research context.', 'amida-compliance' ) );
		}

		if ( empty( $_POST['amida_state'] ) || strlen( $_POST['amida_state'] ) !== 2 ) {
			$errors->add( 'amida_state', __( 'Valid 2-letter state required.', 'amida-compliance' ) );
		}

		return $errors;
	}

	/**
	 * Persist the Amida registration meta and assign the researcher role.
	 */
	public static function on_register( int $user_id ): void {
		$meta = [
			'first_name'                 => sanitize_text_field( $_POST['first_name'] ?? '' ),
			'last_name'                  => sanitize_text_field( $_POST['last_name'] ?? '' ),
			'amida_research_context'     => sanitize_text_field( $_POST['amida_research_context'] ?? '' ),
			'amida_state'                => strtoupper( sanitize_text_field( $_POST['amida_state'] ?? '' ) ),
			'amida_institution'          => sanitize_text_field( $_POST['amida_institution'] ?? '' ),
			'amida_research_purpose'     => sanitize_textarea_field( $_POST['amida_research_purpose'] ?? '' ),
			'amida_age_verified'         => 1,
			'amida_age_verified_at'      => current_time( 'mysql', true ),
			'amida_age_verification_method' => AMIDA_ATTEST_METHOD,
			'amida_ruo_agreed_at'        => current_time( 'mysql', true ),
			'amida_compliance_agreement' => wp_json_encode( [
				'age'      => ! empty( $_POST['amida_agree_age'] ),
				'ruo'      => ! empty( $_POST['amida_agree_ruo'] ),
				'policies' => ! empty( $_POST['amida_agree_policies'] ),
				'at'       => current_time( 'mysql', true ),
			] ),
		];

		foreach ( $meta as $k => $v ) {
			update_user_meta( $user_id, $k, $v );
		}

		$user = new WP_User( $user_id );
		$user->set_role( Amida_Roles::RESEARCHER );

		Amida_Compliance_Log::log(
			'account_registered',
			[
				'research_context' => $meta['amida_research_context'],
				'state'            => $meta['amida_state'],
			],
			$user_id,
			$meta['amida_state']
		);
	}

	/**
	 * Record a successful login and refresh the RUO attestation timestamp.
	 */
	public static function on_login( string $user_login, WP_User $user ): void {
		update_user_meta( $user->ID, 'amida_ruo_agreed_at', current_time( 'mysql', true ) );

		Amida_Compliance_Log::log(
			'sign_in_attested',
			[
				'login' => $user_login,
				'ruo'   => ! empty( $_POST['amida_ruo_reattest'] ),
			],
			$user->ID,
			get_user_meta( $user->ID, 'amida_state', true )
		);
	}

	public static function on_logout(): void {
		setcookie( 'amida_sid', '', time() - 3600, '/', COOKIE_DOMAIN, is_ssl(), true );
	}

	public static function intercept_wp_login_register(): void {
		// Ensures wp-login.php?action=register honors our field validation by
		// simply enabling the filter. Logic lives in registration_errors().
	}

	public static function validate_registration(): void {
		// Placeholder for additional pre-register validation hooks.
	}
}
