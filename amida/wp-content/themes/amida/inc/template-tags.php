<?php
/**
 * Template helpers used by theme partials.
 *
 * @package Amida
 */

defined( 'ABSPATH' ) || exit;

/**
 * Output the site logo (wordmark).
 */
function amida_logo( $url = null ): void {
	$url = $url ?: home_url( '/' );
	printf(
		'<a href="%s" class="site-logo" aria-label="%s">Amida</a>',
		esc_url( $url ),
		esc_attr__( 'Amida home', 'amida' )
	);
}

/**
 * Echo the RUO chip used on PDP and product cards.
 */
function amida_ruo_chip(): void {
	echo '<span class="ruo-chip" aria-label="Research Use Only"><svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><circle cx="5" cy="5" r="4" fill="currentColor"/></svg> RUO — Research Use Only</span>';
}

/**
 * Return the current user's researcher display name or empty string.
 */
function amida_user_name(): string {
	if ( ! is_user_logged_in() ) {
		return '';
	}
	$u = wp_get_current_user();
	return $u->first_name ?: $u->display_name;
}

/**
 * Check whether the current request is an NY IP. Compliance plugin populates
 * this; theme just reads the filter.
 */
function amida_is_ny_enhanced(): bool {
	return (bool) apply_filters( 'amida/ny_enhanced_flow', false );
}

/**
 * Render the approved footer compliance block. Must appear on every page.
 */
function amida_footer_compliance(): void {
	?>
	<div class="footer-compliance">
		<strong>⚠ MANDATORY LEGAL DISCLAIMER</strong>
		<p>"For Research Use Only. Not for Human Consumption."</p>
		<p>All products are sold for research, laboratory, or analytical purposes only, and are not for human consumption.</p>
		<p>AM Holdings, LLC (DBA Amida) is a chemical supplier. AM Holdings is not a compounding pharmacy or chemical compounding facility as defined under 503A of the Federal Food, Drug, and Cosmetic Act. AM Holdings is not an outsourcing facility as defined under 503B.</p>
		<p>The statements made within this website have not been evaluated by the U.S. Food and Drug Administration. The products we offer are not intended to diagnose, treat, cure, or prevent any disease.</p>
		<p>Human/Animal Consumption Prohibited. Laboratory/In-Vitro Experimental Use Only.</p>
	</div>
	<?php
}

/**
 * Format a USD price without trailing zero cents when even dollars.
 */
function amida_price( float $amount ): string {
	if ( fmod( $amount, 1 ) === 0.0 ) {
		return '$' . number_format( $amount, 0 );
	}
	return '$' . number_format( $amount, 2 );
}

/**
 * Compute pack price savings vs. single-vial unit price.
 */
function amida_pack_savings( float $single, float $pack, int $qty ): int {
	$full = $single * $qty;
	if ( $full <= 0 ) {
		return 0;
	}
	return (int) round( ( 1 - ( $pack / $full ) ) * 100 );
}
