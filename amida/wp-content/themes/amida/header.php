<?php
/**
 * Site header. Loaded on every request. Age gate modal is injected here by
 * the compliance plugin via the `amida/age_gate_html` filter.
 *
 * @package Amida
 */
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
	<meta name="format-detection" content="telephone=no">
	<?php wp_head(); ?>
</head>
<body <?php body_class( 'amida-body' ); ?>>
<?php wp_body_open(); ?>

<?php
// Age gate modal — rendered for unverified sessions by compliance plugin.
echo apply_filters( 'amida/age_gate_html', '' );
?>

<header class="site-header" role="banner">
	<div class="container site-header__inner">
		<?php amida_logo(); ?>

		<nav class="site-nav" aria-label="<?php esc_attr_e( 'Primary', 'amida' ); ?>">
			<?php if ( is_user_logged_in() ) : ?>
				<ul class="site-nav">
					<li><a href="<?php echo esc_url( home_url( '/catalog' ) ); ?>"><?php esc_html_e( 'Catalog', 'amida' ); ?></a></li>
					<li><a href="<?php echo esc_url( home_url( '/account/coa-library' ) ); ?>"><?php esc_html_e( 'COAs', 'amida' ); ?></a></li>
					<li><a href="<?php echo esc_url( home_url( '/account' ) ); ?>"><?php esc_html_e( 'Account', 'amida' ); ?></a></li>
				</ul>
			<?php else : ?>
				<ul class="site-nav">
					<li><a href="<?php echo esc_url( home_url( '/about' ) ); ?>"><?php esc_html_e( 'About', 'amida' ); ?></a></li>
					<li><a href="<?php echo esc_url( home_url( '/contact' ) ); ?>"><?php esc_html_e( 'Contact', 'amida' ); ?></a></li>
					<li><a href="<?php echo esc_url( home_url( '/login' ) ); ?>"><?php esc_html_e( 'Sign In', 'amida' ); ?></a></li>
					<li><a class="btn" href="<?php echo esc_url( home_url( '/register' ) ); ?>"><?php esc_html_e( 'Create Account', 'amida' ); ?></a></li>
				</ul>
			<?php endif; ?>
		</nav>

		<?php if ( is_user_logged_in() && function_exists( 'WC' ) ) : ?>
			<button type="button" class="cart-toggle btn btn--ghost" aria-label="<?php esc_attr_e( 'Open cart', 'amida' ); ?>" data-cart-toggle>
				<?php esc_html_e( 'Cart', 'amida' ); ?>
				<span class="cart-count" data-cart-count><?php echo esc_html( WC()->cart ? WC()->cart->get_cart_contents_count() : 0 ); ?></span>
			</button>
		<?php endif; ?>
	</div>
</header>

<main id="content" class="site-main" role="main">
