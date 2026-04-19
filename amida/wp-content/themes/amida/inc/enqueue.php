<?php
/**
 * Enqueue styles + scripts. Google Fonts loaded with display=swap.
 *
 * @package Amida
 */

defined( 'ABSPATH' ) || exit;

add_action( 'wp_enqueue_scripts', function () {
	wp_enqueue_style(
		'amida-fonts',
		'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=DM+Sans:wght@400;500;700&display=swap',
		[],
		null
	);

	wp_enqueue_style(
		'amida-main',
		AMIDA_THEME_URI . '/assets/css/main.css',
		[ 'amida-fonts' ],
		AMIDA_THEME_VERSION
	);

	wp_enqueue_script(
		'amida-cart-drawer',
		AMIDA_THEME_URI . '/assets/js/cart-drawer.js',
		[ 'jquery' ],
		AMIDA_THEME_VERSION,
		true
	);

	wp_localize_script( 'amida-cart-drawer', 'AmidaCart', [
		'ajax_url'      => admin_url( 'admin-ajax.php' ),
		'free_ship_min' => 250,
		'nonce'         => wp_create_nonce( 'amida-cart' ),
	] );

	wp_enqueue_script(
		'amida-pwa-register',
		AMIDA_THEME_URI . '/assets/js/pwa-register.js',
		[],
		AMIDA_THEME_VERSION,
		true
	);

	// PDP interactions (thumbnail gallery, qty stepper, pack/mg pills)
	if ( function_exists( 'is_product' ) && is_product() ) {
		wp_enqueue_script(
			'amida-pdp',
			AMIDA_THEME_URI . '/assets/js/pdp.js',
			[],
			AMIDA_THEME_VERSION,
			true
		);
	}
}, 20 );

/**
 * Preconnect to Google Fonts origins.
 */
add_action( 'wp_head', function () {
	echo '<link rel="preconnect" href="https://fonts.googleapis.com">' . "\n";
	echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' . "\n";
}, 0 );

/**
 * Add manifest link + iOS icons.
 */
add_action( 'wp_head', function () {
	$manifest = home_url( '/manifest.json' );
	echo '<link rel="manifest" href="' . esc_url( $manifest ) . '">' . "\n";
} );
