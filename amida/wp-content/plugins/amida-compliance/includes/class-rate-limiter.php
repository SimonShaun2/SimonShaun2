<?php
/**
 * Simple transient-backed rate limiter for /login and /register (5 attempts
 * per 15 minutes per IP). Compliance-relevant because brute-forced accounts
 * compromise the researcher audit chain.
 *
 * @package AmidaCompliance
 */

defined( 'ABSPATH' ) || exit;

class Amida_Rate_Limiter {

	public const LOGIN_LIMIT    = 5;
	public const LOGIN_WINDOW   = 15 * MINUTE_IN_SECONDS;

	public static function init(): void {
		add_filter( 'authenticate',             [ __CLASS__, 'guard_login' ], 30, 3 );
		add_action( 'wp_login_failed',          [ __CLASS__, 'on_login_failed' ], 10, 1 );
		add_action( 'register_post',            [ __CLASS__, 'guard_register' ], 10, 3 );
	}

	public static function bucket_key( string $scope ): string {
		return 'amida_rl_' . $scope . '_' . md5( amida_client_ip() );
	}

	public static function guard_login( $user, $username, $password ) {
		if ( ! $username ) {
			return $user;
		}
		$key     = self::bucket_key( 'login' );
		$attempts = (int) get_transient( $key );
		if ( $attempts >= self::LOGIN_LIMIT ) {
			Amida_Compliance_Log::log( 'sign_in_failed', [
				'rate_limited' => true,
				'attempts'     => $attempts,
			] );
			return new WP_Error( 'amida_rate_limited', __( 'Too many attempts. Try again in 15 minutes.', 'amida-compliance' ) );
		}
		return $user;
	}

	public static function on_login_failed( string $username ): void {
		$key      = self::bucket_key( 'login' );
		$attempts = (int) get_transient( $key );
		set_transient( $key, $attempts + 1, self::LOGIN_WINDOW );

		Amida_Compliance_Log::log( 'sign_in_failed', [
			'username'     => is_email( $username ) ? substr( $username, 0, 3 ) . '…' : 'redacted',
			'attempts'     => $attempts + 1,
			'rate_limited' => ( $attempts + 1 ) >= self::LOGIN_LIMIT,
		] );
	}

	public static function guard_register( string $login, string $email, WP_Error $errors ): void {
		$key      = self::bucket_key( 'register' );
		$attempts = (int) get_transient( $key );
		if ( $attempts >= self::LOGIN_LIMIT ) {
			$errors->add( 'amida_rl', __( 'Too many registrations from your network. Try again later.', 'amida-compliance' ) );
			return;
		}
		set_transient( $key, $attempts + 1, self::LOGIN_WINDOW );
	}
}
