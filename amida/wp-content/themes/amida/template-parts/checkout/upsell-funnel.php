<?php
/**
 * Post-purchase upsell/downsell funnel (thank-you page).
 *
 * Visual placeholder UI — real upsell logic is owned by CartFlows/FunnelKit
 * which fires its own sequence before the customer reaches this page. This
 * partial gives the customer a recap + a downsell bac-water nudge if the
 * funnel was skipped.
 *
 * @package Amida
 */
defined( 'ABSPATH' ) || exit;
?>
<section style="margin-top:32px;display:grid;gap:16px">
	<div class="product-card" style="padding:24px">
		<div class="hero__eyebrow"><?php esc_html_e( 'Upsell 1 · Bundle Boost', 'amida' ); ?></div>
		<h3 style="margin:4px 0 8px"><?php esc_html_e( 'Add 3 more of the same SKU — 30% off', 'amida' ); ?></h3>
		<p style="color:var(--warm);font-size:.92rem;margin-bottom:16px"><?php esc_html_e( 'One-click purchase using the card on file. Ships with your existing order.', 'amida' ); ?></p>
		<a class="btn" href="<?php echo esc_url( home_url( '/catalog' ) ); ?>"><?php esc_html_e( 'Add Bundle Boost', 'amida' ); ?></a>
	</div>

	<div class="product-card" style="padding:24px">
		<div class="hero__eyebrow"><?php esc_html_e( 'Upsell 2 · Research Kit', 'amida' ); ?></div>
		<h3 style="margin:4px 0 8px"><?php esc_html_e( 'Complete Research Kit — $89', 'amida' ); ?></h3>
		<p style="color:var(--warm);font-size:.92rem;margin-bottom:16px"><?php esc_html_e( '10× bacteriostatic water, 100 insulin syringes, 200 alcohol swabs.', 'amida' ); ?></p>
		<a class="btn btn--amber" href="<?php echo esc_url( home_url( '/catalog' ) ); ?>"><?php esc_html_e( 'Add Research Kit', 'amida' ); ?></a>
	</div>

	<div class="product-card" style="padding:24px">
		<div class="hero__eyebrow"><?php esc_html_e( 'Downsell · Bac Water', 'amida' ); ?></div>
		<h3 style="margin:4px 0 8px"><?php esc_html_e( 'Bacteriostatic water — $9.99 (break-even)', 'amida' ); ?></h3>
		<p style="color:var(--warm);font-size:.92rem;margin-bottom:16px"><?php esc_html_e( 'A single vial to complete your setup.', 'amida' ); ?></p>
		<a class="btn btn--ghost" href="<?php echo esc_url( home_url( '/catalog' ) ); ?>"><?php esc_html_e( 'Add Bac Water', 'amida' ); ?></a>
	</div>
</section>
