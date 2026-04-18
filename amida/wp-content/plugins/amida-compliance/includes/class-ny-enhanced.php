<?php
/**
 * NY General Business Law § 391-bb enhanced flow.
 *
 * Triggers when the visitor's IP geolocates to New York OR when the visitor
 * self-identifies NY residency on the age gate. No cookie caching — re-prompt
 * every session. Additional attestation fields are collected and persisted.
 *
 * @package AmidaCompliance
 */

defined( 'ABSPATH' ) || exit;

class Amida_NY_Enhanced {

	public static function init(): void {
		add_filter( 'amida/ny_enhanced_flow', [ __CLASS__, 'is_ny_visitor' ] );
	}

	/**
	 * Basic detection. Hooks can override with full geoip:
	 *   add_filter( 'amida/is_ny_visitor', fn( $default ) => $maxmind_result );
	 */
	public static function is_ny_visitor(): bool {
		$detected = false;

		// User meta wins over IP.
		if ( is_user_logged_in() ) {
			$state = get_user_meta( get_current_user_id(), 'amida_state', true );
			if ( 'NY' === strtoupper( (string) $state ) ) {
				$detected = true;
			}
		}

		// CF-IPCountry / CF-IPState header support (if behind Cloudflare).
		if ( ! $detected && ! empty( $_SERVER['HTTP_CF_REGION_CODE'] ) && 'NY' === strtoupper( $_SERVER['HTTP_CF_REGION_CODE'] ) ) {
			$detected = true;
		}

		// Self-reported via query string or cookie.
		if ( ! $detected && ( isset( $_GET['ny_enhanced'] ) || ! empty( $_COOKIE['amida_ny_self'] ) ) ) {
			$detected = true;
		}

		return (bool) apply_filters( 'amida/is_ny_visitor', $detected );
	}

	public static function log_enhanced( array $fields = [], ?int $user_id = null ): void {
		Amida_Compliance_Log::log(
			'ny_state_enhanced_verify',
			[
				'additional_fields_collected' => $fields,
				'method'                      => AMIDA_ATTEST_METHOD,
			],
			$user_id,
			'NY'
		);
	}
}
