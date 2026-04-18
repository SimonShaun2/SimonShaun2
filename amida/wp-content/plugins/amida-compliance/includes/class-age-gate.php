<?php
/**
 * 21+ age gate with penalty-of-perjury attestation.
 *
 * Renders a full-screen modal on every request where the cookie
 * AMIDA_AGE_COOKIE_NAME is missing. AJAX-accepting via admin-ajax.php. NY
 * visitors never get the cookie cached (Amida_NY_Enhanced forces a re-prompt).
 *
 * @package AmidaCompliance
 */

defined( 'ABSPATH' ) || exit;

class Amida_Age_Gate {

	public static function init(): void {
		add_filter( 'amida/age_gate_html', [ __CLASS__, 'maybe_render' ] );
		add_action( 'wp_ajax_nopriv_amida_age_gate', [ __CLASS__, 'handle_ajax' ] );
		add_action( 'wp_ajax_amida_age_gate',        [ __CLASS__, 'handle_ajax' ] );
		add_action( 'wp_enqueue_scripts',            [ __CLASS__, 'enqueue' ] );
	}

	/**
	 * Should the gate fire for this request?
	 */
	public static function required(): bool {
		// Assets / admin / cron / AJAX are skipped.
		if ( is_admin() || wp_doing_ajax() || wp_doing_cron() ) {
			return false;
		}
		if ( ! empty( $_COOKIE[ AMIDA_AGE_COOKIE_NAME ] ) ) {
			// NY forces re-attestation every session.
			if ( Amida_NY_Enhanced::is_ny_visitor() ) {
				return true;
			}
			return false;
		}
		return true;
	}

	public static function enqueue(): void {
		if ( ! self::required() ) {
			return;
		}
		wp_enqueue_script(
			'amida-age-gate',
			AMIDA_COMPL_URL . 'assets/js/age-gate.js',
			[],
			AMIDA_COMPL_VERSION,
			true
		);
		wp_localize_script( 'amida-age-gate', 'AmidaAgeGate', [
			'ajax_url' => admin_url( 'admin-ajax.php' ),
			'nonce'    => wp_create_nonce( 'amida_age_gate' ),
			'is_ny'    => Amida_NY_Enhanced::is_ny_visitor(),
		] );
	}

	/**
	 * HTML injected into the theme header via filter.
	 */
	public static function maybe_render( string $html ): string {
		if ( ! self::required() ) {
			return $html;
		}
		ob_start();
		include AMIDA_COMPL_DIR . 'templates/age-gate-modal.php';
		return ob_get_clean();
	}

	/**
	 * AJAX: receive agree/disagree. Response tells the client where to go next.
	 */
	public static function handle_ajax(): void {
		check_ajax_referer( 'amida_age_gate', 'nonce' );

		$action    = sanitize_text_field( $_POST['decision'] ?? '' );
		$state     = strtoupper( sanitize_text_field( $_POST['state'] ?? '' ) );
		$agreements = [
			'I'   => ! empty( $_POST['agree_1'] ),
			'II'  => ! empty( $_POST['agree_2'] ),
			'III' => ! empty( $_POST['agree_3'] ),
			'age' => ! empty( $_POST['agree_age'] ),
		];

		if ( 'refuse' === $action ) {
			Amida_Compliance_Log::log( 'age_gate_refused', [ 'state' => $state ], null, $state );
			wp_send_json_success( [ 'redirect' => 'https://google.com' ] );
		}

		if ( 'agree' !== $action || ! $agreements['age'] ) {
			wp_send_json_error( [ 'error' => __( 'All attestations required.', 'amida-compliance' ) ] );
		}

		// Set cookie (HttpOnly + Secure where possible).
		$expire = time() + ( DAY_IN_SECONDS * (int) AMIDA_AGE_COOKIE_TTL_DAYS );
		setcookie(
			AMIDA_AGE_COOKIE_NAME,
			'1',
			[
				'expires'  => $expire,
				'path'     => '/',
				'domain'   => COOKIE_DOMAIN,
				'secure'   => is_ssl(),
				'httponly' => true,
				'samesite' => 'Lax',
			]
		);
		setcookie(
			'amida_age_method',
			AMIDA_ATTEST_METHOD,
			[
				'expires'  => $expire,
				'path'     => '/',
				'domain'   => COOKIE_DOMAIN,
				'secure'   => is_ssl(),
				'httponly' => true,
				'samesite' => 'Lax',
			]
		);

		Amida_Compliance_Log::log(
			'age_gate_passed',
			[
				'method'           => AMIDA_ATTEST_METHOD,
				'age_confirmed'    => AMIDA_MIN_AGE,
				'disclaimers'      => [ 'I', 'II', 'III' ],
				'agreements'       => $agreements,
				'state'            => $state ?: null,
			],
			null,
			$state
		);

		$redirect = esc_url_raw( $_POST['redirect'] ?? home_url( '/login' ) );
		wp_send_json_success( [ 'redirect' => $redirect ] );
	}
}
