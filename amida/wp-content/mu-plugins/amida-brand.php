<?php
/**
 * Plugin Name: Amida Brand Constants
 * Description: Centralized brand/legal constants for AM Holdings, LLC dba Amida. Must-use plugin — loads before everything else so theme + plugins can rely on these values.
 * Version: 1.0.0
 * Author: AM Holdings, LLC
 * License: Proprietary
 *
 * NEVER hardcode address / email / legal-name anywhere else. Always reference
 * these constants via `defined('AMIDA_FOO') ? AMIDA_FOO : 'fallback'`.
 */

defined( 'ABSPATH' ) || exit;

/* -- Legal entity -------------------------------------------------------- */
define( 'AMIDA_LEGAL_NAME',   'AM Holdings, LLC' );
define( 'AMIDA_DBA',          'Amida' );
define( 'AMIDA_STATE',        'Wyoming' );
define( 'AMIDA_ENTITY_TYPE',  'Single-Member LLC' );

/* -- Address ------------------------------------------------------------- */
define( 'AMIDA_ADDR_LINE_1',  '30 N Gould Street' );
define( 'AMIDA_ADDR_CITY',    'Sheridan' );
define( 'AMIDA_ADDR_STATE',   'WY' );
define( 'AMIDA_ADDR_ZIP',     '82801' );
define( 'AMIDA_ADDR_FULL',    '30 N Gould Street, Sheridan, WY 82801' );

/* -- Contact ------------------------------------------------------------- */
define( 'AMIDA_SUPPORT_EMAIL', 'support@amida.com' );
define( 'AMIDA_LEGAL_EMAIL',   'legal@amida.com' );
define( 'AMIDA_SUPPORT_PHONE', '(307) XXX-XXXX' ); // TODO: update when provisioned
define( 'AMIDA_TELEGRAM_URL',  '' );               // TODO: update when channel created

/* -- Compliance ---------------------------------------------------------- */
define( 'AMIDA_MIN_AGE',                21 );
define( 'AMIDA_ATTEST_METHOD',          'penalty_of_perjury_attestation' );
define( 'AMIDA_ENHANCED_FLOW_STATES',   serialize( [ 'NY' ] ) );
define( 'AMIDA_AGE_COOKIE_NAME',        'amida_age_verified' );
define( 'AMIDA_AGE_COOKIE_TTL_DAYS',    30 );

/* -- Commerce ------------------------------------------------------------ */
define( 'AMIDA_FREE_SHIPPING_THRESHOLD', 250 );
define( 'AMIDA_BILLING_DESCRIPTOR',      'AMIDA RESEARCH' ); // ≤22 chars
define( 'AMIDA_PROCESSOR',               'bankful' );        // bankful|easy_pay|corepay|allay|durango

/* -- Feature flags ------------------------------------------------------- */
define( 'AMIDA_GLP_ENABLED',             true );  // master switch for GLP product family visibility
define( 'AMIDA_IMAGE_MASK_ENABLED',      true );
define( 'AMIDA_PUBLIC_CATALOG_ENABLED',  false ); // MUST be false at launch

/**
 * Returns the full legal address block as HTML, newline-escaped for template
 * usage. Safe to echo.
 */
function amida_brand_address_html(): string {
	return sprintf(
		'<strong>%1$s (DBA %2$s)</strong><br>%3$s<br>%4$s, %5$s %6$s',
		esc_html( AMIDA_LEGAL_NAME ),
		esc_html( AMIDA_DBA ),
		esc_html( AMIDA_ADDR_LINE_1 ),
		esc_html( AMIDA_ADDR_CITY ),
		esc_html( AMIDA_ADDR_STATE ),
		esc_html( AMIDA_ADDR_ZIP )
	);
}

/**
 * Single-line plaintext address (used in emails, CSV exports, billing
 * descriptors configuration).
 */
function amida_brand_address_line(): string {
	return AMIDA_ADDR_FULL;
}
