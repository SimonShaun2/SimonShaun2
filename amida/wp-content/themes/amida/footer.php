<?php
/**
 * Footer with the full compliance stack. Must appear on every page.
 *
 * @package Amida
 */
?>
</main>

<footer class="site-footer" role="contentinfo">
	<div class="container">
		<div class="footer-columns">
			<div class="footer-col footer-col--brand">
				<div class="site-logo" style="color:var(--cream);margin-bottom:16px">Amida</div>
				<p style="font-size:.92rem;color:rgba(245,240,232,.72);max-width:340px">
					<?php esc_html_e( 'USA lab-sourced research-grade peptides for qualified researchers.', 'amida' ); ?>
				</p>
			</div>

			<div class="footer-col">
				<h5><?php esc_html_e( 'Catalog', 'amida' ); ?></h5>
				<ul class="footer-list" style="list-style:none;padding:0;margin:0;display:grid;gap:8px">
					<li><a href="<?php echo esc_url( home_url( '/catalog' ) ); ?>"><?php esc_html_e( 'All Compounds', 'amida' ); ?></a></li>
					<li><a href="<?php echo esc_url( home_url( '/category/blends' ) ); ?>"><?php esc_html_e( 'Blends', 'amida' ); ?></a></li>
					<li><a href="<?php echo esc_url( home_url( '/category/bundles' ) ); ?>"><?php esc_html_e( 'Bundles', 'amida' ); ?></a></li>
				</ul>
			</div>

			<div class="footer-col">
				<h5><?php esc_html_e( 'Compliance', 'amida' ); ?></h5>
				<ul class="footer-list" style="list-style:none;padding:0;margin:0;display:grid;gap:8px">
					<li><a href="<?php echo esc_url( home_url( '/ruo-policy' ) ); ?>"><?php esc_html_e( 'Research Use Policy', 'amida' ); ?></a></li>
					<li><a href="<?php echo esc_url( home_url( '/age-verification-policy' ) ); ?>"><?php esc_html_e( 'Age Verification', 'amida' ); ?></a></li>
					<li><a href="<?php echo esc_url( home_url( '/account/coa-library' ) ); ?>"><?php esc_html_e( 'Certificates', 'amida' ); ?></a></li>
					<li><a href="<?php echo esc_url( home_url( '/terms' ) ); ?>"><?php esc_html_e( 'Terms of Service', 'amida' ); ?></a></li>
					<li><a href="<?php echo esc_url( home_url( '/privacy' ) ); ?>"><?php esc_html_e( 'Privacy Policy', 'amida' ); ?></a></li>
					<li><a href="<?php echo esc_url( home_url( '/shipping-policy' ) ); ?>"><?php esc_html_e( 'Shipping Policy', 'amida' ); ?></a></li>
					<li><a href="<?php echo esc_url( home_url( '/refund-policy' ) ); ?>"><?php esc_html_e( 'Refund Policy', 'amida' ); ?></a></li>
					<li><a href="<?php echo esc_url( home_url( '/disclaimer' ) ); ?>"><?php esc_html_e( 'Disclaimer', 'amida' ); ?></a></li>
				</ul>
			</div>

			<div class="footer-col">
				<h5><?php esc_html_e( 'Support', 'amida' ); ?></h5>
				<ul class="footer-list" style="list-style:none;padding:0;margin:0;display:grid;gap:8px">
					<li><a href="<?php echo esc_url( home_url( '/help' ) ); ?>"><?php esc_html_e( 'Help Center', 'amida' ); ?></a></li>
					<li><a href="<?php echo esc_url( home_url( '/contact' ) ); ?>"><?php esc_html_e( 'Contact', 'amida' ); ?></a></li>
					<li><a href="https://t.me/amida_research" rel="noopener" target="_blank"><?php esc_html_e( 'Telegram', 'amida' ); ?></a></li>
					<li><a href="mailto:support@amida.com">support@amida.com</a></li>
				</ul>
			</div>
		</div>

		<div style="margin-bottom:24px">
			<strong style="color:var(--cream);font-family:var(--font-display);font-size:1.2rem;font-weight:400;letter-spacing:.08em">
				<?php echo esc_html( strtoupper( defined( 'AMIDA_LEGAL_NAME' ) ? AMIDA_LEGAL_NAME : 'AM Holdings, LLC' ) ); ?>
			</strong>
			<div style="font-size:.85rem;color:rgba(245,240,232,.7);margin-top:4px">
				DBA <?php echo esc_html( defined( 'AMIDA_DBA' ) ? AMIDA_DBA : 'Amida' ); ?><br>
				<?php echo esc_html( defined( 'AMIDA_ADDR_FULL' ) ? AMIDA_ADDR_FULL : '' ); ?><br>
				<a href="mailto:<?php echo esc_attr( defined( 'AMIDA_SUPPORT_EMAIL' ) ? AMIDA_SUPPORT_EMAIL : '' ); ?>" style="color:inherit">
					<?php echo esc_html( defined( 'AMIDA_SUPPORT_EMAIL' ) ? AMIDA_SUPPORT_EMAIL : '' ); ?>
				</a>
				<?php if ( defined( 'AMIDA_SUPPORT_PHONE' ) ) : ?>
					· <?php echo esc_html( AMIDA_SUPPORT_PHONE ); ?>
				<?php endif; ?>
			</div>
		</div>

		<?php amida_footer_compliance(); ?>

		<div class="footer-copyright">
			<span>© <?php echo esc_html( date( 'Y' ) ); ?> AM Holdings, LLC. All Rights Reserved.</span>
			<span>For Research Use Only · Not for Human Consumption</span>
		</div>
	</div>
</footer>

<?php
// Cart drawer — only rendered for authenticated researchers.
if ( is_user_logged_in() && function_exists( 'WC' ) ) {
	get_template_part( 'template-parts/cart/drawer' );
}

// Mobile tab bar for authenticated users.
if ( is_user_logged_in() ) {
	get_template_part( 'template-parts/mobile/tabbar' );
}

wp_footer();
?>
</body>
</html>
