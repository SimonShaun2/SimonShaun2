<?php
/**
 * Template Name: Amida — Public Landing
 *
 * Crawler-safe homepage. Zero product names, zero compound references.
 * Trust signals, research framing, and auth CTAs only.
 *
 * @package Amida
 */

get_header();
?>

<section class="hero">
	<div class="container">
		<div class="hero__eyebrow"><?php esc_html_e( 'Research Compounds · USA Lab-Sourced', 'amida' ); ?></div>
		<h1 class="hero__title"><?php esc_html_e( 'Research compounds, documented and verified.', 'amida' ); ?></h1>
		<p class="hero__subtitle">
			<?php esc_html_e( 'Third-party HPLC tested. Batch-specific Certificates of Analysis. Same-day domestic shipping for qualified researchers.', 'amida' ); ?>
		</p>
		<div class="hero__cta">
			<a class="btn btn--lg" href="<?php echo esc_url( home_url( '/register' ) ); ?>">
				<?php esc_html_e( 'Create Researcher Account', 'amida' ); ?>
			</a>
			<a class="btn btn--ghost btn--lg" href="<?php echo esc_url( home_url( '/login' ) ); ?>">
				<?php esc_html_e( 'Sign In', 'amida' ); ?>
			</a>
		</div>
	</div>
</section>

<section class="trust-band container">
	<div class="trust-item">
		<div class="trust-item__value">99%+</div>
		<div class="trust-item__label"><?php esc_html_e( 'Purity', 'amida' ); ?></div>
	</div>
	<div class="trust-item">
		<div class="trust-item__value">HPLC</div>
		<div class="trust-item__label"><?php esc_html_e( 'Every Batch', 'amida' ); ?></div>
	</div>
	<div class="trust-item">
		<div class="trust-item__value">24h</div>
		<div class="trust-item__label"><?php esc_html_e( 'Domestic Ship', 'amida' ); ?></div>
	</div>
	<div class="trust-item">
		<div class="trust-item__value">3P</div>
		<div class="trust-item__label"><?php esc_html_e( 'Tested', 'amida' ); ?></div>
	</div>
</section>

<section class="container" style="padding: 96px 0; max-width: 880px">
	<h2 style="text-align:center;margin-bottom:24px"><?php esc_html_e( 'Documentation-first. Always.', 'amida' ); ?></h2>
	<p style="text-align:center;font-size:1.1rem;color:var(--warm);line-height:1.7">
		<?php esc_html_e( 'Every batch is paired with a signed Certificate of Analysis from an independent laboratory. Purity is verified by HPLC. Endotoxin and residual solvents are reported. Batch numbers follow your order from cart to shipping label to your COA library.', 'amida' ); ?>
	</p>
	<div style="text-align:center;margin-top:32px">
		<a class="btn" href="<?php echo esc_url( home_url( '/register' ) ); ?>"><?php esc_html_e( 'Register to access documentation', 'amida' ); ?></a>
	</div>
</section>

<section style="background: var(--cream-deep); padding: 72px 0">
	<div class="container" style="max-width: 960px">
		<div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center">
			<div>
				<h3 style="margin-bottom:16px"><?php esc_html_e( 'For qualified researchers only.', 'amida' ); ?></h3>
				<p style="color:var(--warm);line-height:1.7">
					<?php esc_html_e( 'Amida serves independent laboratories, academic researchers, and biotech teams. Our catalog is fully login-gated and our checkout enforces a penalty-of-perjury research-use attestation on every session.', 'amida' ); ?>
				</p>
			</div>
			<div style="background:var(--cream-light);border:1px solid var(--border);border-radius:var(--radius-lg);padding:32px">
				<h4 style="margin-bottom:20px"><?php esc_html_e( 'Access requirements', 'amida' ); ?></h4>
				<ul style="list-style:none;padding:0;margin:0;display:grid;gap:12px;font-size:.94rem">
					<li>✓ <?php esc_html_e( '21+ age attestation', 'amida' ); ?></li>
					<li>✓ <?php esc_html_e( 'Research-use only agreement', 'amida' ); ?></li>
					<li>✓ <?php esc_html_e( 'Verified email address', 'amida' ); ?></li>
					<li>✓ <?php esc_html_e( 'Research context disclosure', 'amida' ); ?></li>
				</ul>
			</div>
		</div>
	</div>
</section>

<?php get_footer();
