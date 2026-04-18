<?php
/**
 * PWA integration: rewrite rules to expose /manifest.json and /sw.js at the
 * site root (required by most browsers for service worker scope).
 *
 * @package Amida
 */

defined( 'ABSPATH' ) || exit;

add_action( 'init', function () {
	add_rewrite_rule( '^manifest\.json$', 'index.php?amida_pwa=manifest', 'top' );
	add_rewrite_rule( '^sw\.js$', 'index.php?amida_pwa=sw', 'top' );
	add_rewrite_rule( '^offline$', 'index.php?amida_pwa=offline', 'top' );
} );

add_filter( 'query_vars', function ( $vars ) {
	$vars[] = 'amida_pwa';
	return $vars;
} );

add_action( 'template_redirect', function () {
	$pwa = get_query_var( 'amida_pwa' );
	if ( ! $pwa ) {
		return;
	}

	if ( 'manifest' === $pwa ) {
		status_header( 200 );
		header( 'Content-Type: application/manifest+json; charset=utf-8' );
		header( 'Cache-Control: public, max-age=86400' );
		echo wp_json_encode( amida_pwa_manifest(), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES );
		exit;
	}

	if ( 'sw' === $pwa ) {
		status_header( 200 );
		header( 'Content-Type: application/javascript; charset=utf-8' );
		header( 'Service-Worker-Allowed: /' );
		header( 'Cache-Control: no-cache' );
		$file = AMIDA_THEME_DIR . '/assets/js/service-worker.js';
		if ( file_exists( $file ) ) {
			readfile( $file );
		}
		exit;
	}

	if ( 'offline' === $pwa ) {
		status_header( 200 );
		include AMIDA_THEME_DIR . '/template-parts/offline.php';
		exit;
	}
} );

function amida_pwa_manifest(): array {
	return [
		'name'             => 'Amida — Research Compounds',
		'short_name'       => 'Amida',
		'description'      => 'Research-grade compounds for qualified researchers. Documented, verified, HPLC-tested.',
		'start_url'        => '/',
		'scope'            => '/',
		'display'          => 'standalone',
		'orientation'      => 'portrait-primary',
		'background_color' => '#F5F0E8',
		'theme_color'      => '#4A5E4A',
		'categories'       => [ 'science', 'business' ],
		'icons'            => [
			[
				'src'     => AMIDA_THEME_URI . '/assets/images/icon-192.png',
				'sizes'   => '192x192',
				'type'    => 'image/png',
				'purpose' => 'any maskable',
			],
			[
				'src'     => AMIDA_THEME_URI . '/assets/images/icon-512.png',
				'sizes'   => '512x512',
				'type'    => 'image/png',
				'purpose' => 'any maskable',
			],
		],
		'shortcuts'        => [
			[
				'name'        => 'Catalog',
				'url'         => '/catalog',
				'description' => 'Browse compounds',
			],
			[
				'name'        => 'COA Library',
				'url'         => '/account/coa-library',
				'description' => 'Download certificates',
			],
			[
				'name'        => 'Account',
				'url'         => '/account',
				'description' => 'Your researcher account',
			],
		],
	];
}
