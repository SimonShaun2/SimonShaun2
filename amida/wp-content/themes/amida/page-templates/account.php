<?php
/**
 * Template Name: Amida — Account (Gated)
 *
 * Researcher account dashboard. Links to orders, COA library, saved items,
 * settings, and sign-out.
 *
 * @package Amida
 */

if ( ! is_user_logged_in() ) {
	wp_safe_redirect( add_query_arg( 'redirect', rawurlencode( home_url( '/account' ) ), home_url( '/login' ) ) );
	exit;
}

get_header();
?>
<section class="container" style="padding: 48px 0; max-width: 960px">
	<h1 style="margin-bottom:8px"><?php printf( esc_html__( 'Hello, %s.', 'amida' ), esc_html( amida_user_name() ) ); ?></h1>
	<p style="color:var(--warm)"><?php esc_html_e( 'Your researcher account dashboard.', 'amida' ); ?></p>

	<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;margin-top:36px">
		<a href="<?php echo esc_url( home_url( '/account/orders' ) ); ?>" class="product-card" style="padding:24px;text-decoration:none">
			<h3 style="font-size:1.3rem;margin-bottom:6px"><?php esc_html_e( 'Orders', 'amida' ); ?></h3>
			<p style="color:var(--muted);font-size:.9rem;margin:0"><?php esc_html_e( 'View history, tracking, and COAs.', 'amida' ); ?></p>
		</a>
		<a href="<?php echo esc_url( home_url( '/account/coa-library' ) ); ?>" class="product-card" style="padding:24px;text-decoration:none">
			<h3 style="font-size:1.3rem;margin-bottom:6px"><?php esc_html_e( 'COA Library', 'amida' ); ?></h3>
			<p style="color:var(--muted);font-size:.9rem;margin:0"><?php esc_html_e( 'Download batch certificates.', 'amida' ); ?></p>
		</a>
		<a href="<?php echo esc_url( home_url( '/account/saved' ) ); ?>" class="product-card" style="padding:24px;text-decoration:none">
			<h3 style="font-size:1.3rem;margin-bottom:6px"><?php esc_html_e( 'Saved Compounds', 'amida' ); ?></h3>
			<p style="color:var(--muted);font-size:.9rem;margin:0"><?php esc_html_e( 'Reorder common items quickly.', 'amida' ); ?></p>
		</a>
		<a href="<?php echo esc_url( home_url( '/account/settings' ) ); ?>" class="product-card" style="padding:24px;text-decoration:none">
			<h3 style="font-size:1.3rem;margin-bottom:6px"><?php esc_html_e( 'Profile & Settings', 'amida' ); ?></h3>
			<p style="color:var(--muted);font-size:.9rem;margin:0"><?php esc_html_e( 'Update researcher context and preferences.', 'amida' ); ?></p>
		</a>
	</div>

	<div style="margin-top:48px;padding-top:24px;border-top:1px solid var(--border)">
		<a href="<?php echo esc_url( wp_logout_url( home_url() ) ); ?>" class="btn btn--ghost"><?php esc_html_e( 'Sign Out', 'amida' ); ?></a>
	</div>
</section>
<?php get_footer();
