<?php
/**
 * Theme setup: supports, menus, image sizes.
 *
 * @package Amida
 */

defined( 'ABSPATH' ) || exit;

add_action( 'after_setup_theme', function () {
	load_theme_textdomain( 'amida', AMIDA_THEME_DIR . '/languages' );

	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'responsive-embeds' );
	add_theme_support( 'align-wide' );
	add_theme_support( 'woocommerce', [
		'thumbnail_image_width' => 640,
		'single_image_width'    => 1200,
		'product_grid'          => [
			'default_rows'    => 4,
			'min_rows'        => 1,
			'default_columns' => 3,
			'min_columns'     => 2,
			'max_columns'     => 4,
		],
	] );
	add_theme_support( 'wc-product-gallery-zoom' );
	add_theme_support( 'wc-product-gallery-lightbox' );
	add_theme_support( 'wc-product-gallery-slider' );

	register_nav_menus( [
		'primary'           => __( 'Primary Nav', 'amida' ),
		'footer-catalog'    => __( 'Footer — Catalog', 'amida' ),
		'footer-compliance' => __( 'Footer — Compliance', 'amida' ),
		'footer-support'    => __( 'Footer — Support', 'amida' ),
		'mobile-drawer'     => __( 'Mobile Drawer', 'amida' ),
	] );

	add_image_size( 'amida-product-hero', 1200, 1200, true );
	add_image_size( 'amida-product-card', 640, 640, true );
	add_image_size( 'amida-compound-name', 600, 200, false );
} );

/**
 * Force login redirects are handled by the compliance plugin. Here we only
 * register the custom page templates and set canonical page slugs.
 */
add_filter( 'theme_page_templates', function ( $templates ) {
	$templates['page-templates/landing.php']  = __( 'Amida — Public Landing', 'amida' );
	$templates['page-templates/auth.php']     = __( 'Amida — Auth (Login/Register)', 'amida' );
	$templates['page-templates/catalog.php']  = __( 'Amida — Catalog (Gated)', 'amida' );
	$templates['page-templates/legal.php']    = __( 'Amida — Legal Page', 'amida' );
	$templates['page-templates/account.php']  = __( 'Amida — Account (Gated)', 'amida' );
	return $templates;
} );

/**
 * Remove emoji cruft and unnecessary HTTP headers.
 */
add_action( 'init', function () {
	remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
	remove_action( 'wp_print_styles', 'print_emoji_styles' );
	remove_action( 'wp_head', 'wp_generator' );
	remove_action( 'wp_head', 'wlwmanifest_link' );
	remove_action( 'wp_head', 'rsd_link' );
} );

/**
 * Add iOS PWA meta tags in <head>. The compliance plugin handles service worker
 * registration and manifest linking.
 */
add_action( 'wp_head', function () {
	echo '<meta name="apple-mobile-web-app-capable" content="yes">' . "\n";
	echo '<meta name="apple-mobile-web-app-status-bar-style" content="default">' . "\n";
	echo '<meta name="apple-mobile-web-app-title" content="Amida">' . "\n";
	echo '<meta name="theme-color" content="#4A5E4A">' . "\n";
	echo '<link rel="apple-touch-icon" href="' . esc_url( AMIDA_THEME_URI . '/assets/images/apple-touch-icon-180.png' ) . '">' . "\n";
}, 1 );
