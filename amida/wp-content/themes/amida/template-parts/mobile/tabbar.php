<?php
/**
 * Mobile bottom tab bar — 4 tabs + active state detection.
 *
 * @package Amida
 */
defined( 'ABSPATH' ) || exit;

$here = untrailingslashit( (string) wp_parse_url( $_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH ) ) ?: '/';
$is = fn( string $prefix ) => str_starts_with( $here . '/', $prefix );

$count = function_exists( 'WC' ) && WC()->cart ? WC()->cart->get_cart_contents_count() : 0;
?>
<nav class="mobile-tabbar" aria-label="<?php esc_attr_e( 'Mobile navigation', 'amida' ); ?>">
	<div class="mobile-tabbar__inner">
		<a href="<?php echo esc_url( home_url( '/' ) ); ?>"          class="<?php echo '/' === $here ? 'is-active' : ''; ?>" aria-label="<?php esc_attr_e( 'Home', 'amida' ); ?>">⌂<span><?php esc_html_e( 'Home', 'amida' ); ?></span></a>
		<a href="<?php echo esc_url( home_url( '/catalog' ) ); ?>"   class="<?php echo $is( '/catalog' ) ? 'is-active' : ''; ?>" aria-label="<?php esc_attr_e( 'Shop', 'amida' ); ?>">⌬<span><?php esc_html_e( 'Shop', 'amida' ); ?></span></a>
		<a href="#"                                                  class="<?php echo $is( '/cart' ) ? 'is-active' : ''; ?>" data-cart-toggle aria-label="<?php esc_attr_e( 'Cart', 'amida' ); ?>">⎔<?php if ( $count ) : ?><span class="cart-badge"><?php echo (int) $count; ?></span><?php endif; ?><span><?php esc_html_e( 'Cart', 'amida' ); ?></span></a>
		<a href="<?php echo esc_url( home_url( '/account' ) ); ?>"   class="<?php echo $is( '/account' ) ? 'is-active' : ''; ?>" aria-label="<?php esc_attr_e( 'Account', 'amida' ); ?>">◉<span><?php esc_html_e( 'Account', 'amida' ); ?></span></a>
	</div>
</nav>
