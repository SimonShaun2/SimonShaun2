<?php
/**
 * Plugin Name: Amida Compliance
 * Description: Age gate, RUO attestation, researcher role registration, audit log, NY enhanced flow, image-masking proxy, and admin dashboard. Underwriting-grade compliance for a regulated eCommerce operator.
 * Version: 1.0.0
 * Author: AM Holdings, LLC
 * Requires at least: 6.3
 * Requires PHP: 8.1
 * License: Proprietary
 * Text Domain: amida-compliance
 *
 * @package AmidaCompliance
 */

defined( 'ABSPATH' ) || exit;

define( 'AMIDA_COMPL_VERSION', '1.0.0' );
define( 'AMIDA_COMPL_FILE',    __FILE__ );
define( 'AMIDA_COMPL_DIR',     plugin_dir_path( __FILE__ ) );
define( 'AMIDA_COMPL_URL',     plugin_dir_url( __FILE__ ) );

/**
 * The 15 canonical event types logged by this plugin. Adding a new one? Ship
 * a migration and update the admin filter list and the CSV exporter.
 */
const AMIDA_EVENT_TYPES = [
	'age_gate_passed',
	'age_gate_refused',
	'account_registered',
	'email_verified',
	'sign_in_attested',
	'sign_in_failed',
	'catalog_accessed',
	'product_viewed',
	'add_to_cart',
	'checkout_initiated',
	'checkout_attested',
	'order_placed',
	'ny_state_enhanced_verify',
	'coa_downloaded',
	'gdpr_request',
];

require_once AMIDA_COMPL_DIR . 'includes/class-compliance-log.php';
require_once AMIDA_COMPL_DIR . 'includes/class-roles.php';
require_once AMIDA_COMPL_DIR . 'includes/class-age-gate.php';
require_once AMIDA_COMPL_DIR . 'includes/class-login-gate.php';
require_once AMIDA_COMPL_DIR . 'includes/class-checkout-attestation.php';
require_once AMIDA_COMPL_DIR . 'includes/class-ny-enhanced.php';
require_once AMIDA_COMPL_DIR . 'includes/class-image-masker.php';
require_once AMIDA_COMPL_DIR . 'includes/class-rate-limiter.php';
require_once AMIDA_COMPL_DIR . 'includes/class-batch-log.php';
require_once AMIDA_COMPL_DIR . 'includes/class-admin.php';

register_activation_hook( __FILE__, [ 'Amida_Compliance_Log', 'install' ] );
register_activation_hook( __FILE__, [ 'Amida_Roles',          'install' ] );

/**
 * Bootstrap modules on plugins_loaded so WP core + WC are available.
 */
add_action( 'plugins_loaded', function () {
	Amida_Compliance_Log::init();
	Amida_Roles::init();
	Amida_Age_Gate::init();
	Amida_Login_Gate::init();
	Amida_Checkout_Attestation::init();
	Amida_NY_Enhanced::init();
	Amida_Image_Masker::init();
	Amida_Rate_Limiter::init();
	Amida_Batch_Log::init();
	if ( is_admin() ) {
		Amida_Admin::init();
	}
} );

/**
 * GDPR-safe IP hashing. Hashes the client IP with a site salt so raw IPs are
 * never persisted. Salt is per-install and rotated via `amida_compliance_salt`
 * option (created on activation).
 */
function amida_hash_ip( string $ip = '' ): string {
	if ( '' === $ip ) {
		$ip = amida_client_ip();
	}
	$salt = get_option( 'amida_compliance_salt' );
	if ( ! $salt ) {
		$salt = wp_generate_password( 40, true, true );
		update_option( 'amida_compliance_salt', $salt, false );
	}
	return hash( 'sha256', $ip . $salt );
}

/**
 * Best-effort client IP. Respects X-Forwarded-For from Pressable's trusted
 * proxy chain.
 */
function amida_client_ip(): string {
	if ( ! empty( $_SERVER['HTTP_CF_CONNECTING_IP'] ) ) {
		return sanitize_text_field( $_SERVER['HTTP_CF_CONNECTING_IP'] );
	}
	if ( ! empty( $_SERVER['HTTP_X_FORWARDED_FOR'] ) ) {
		$parts = explode( ',', $_SERVER['HTTP_X_FORWARDED_FOR'] );
		return sanitize_text_field( trim( $parts[0] ) );
	}
	return $_SERVER['REMOTE_ADDR'] ?? '';
}
