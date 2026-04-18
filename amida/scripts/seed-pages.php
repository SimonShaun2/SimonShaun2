<?php
/**
 * WP-CLI pages seeder. Creates the 15 canonical pages from the legal .md
 * files plus the public landing and auth pages. Re-runnable — idempotent.
 *
 * Usage:
 *   wp eval-file scripts/seed-pages.php
 *
 * @package AmidaSeed
 */

defined( 'WP_CLI' ) || exit( "Run via wp-cli only.\n" );

$pages = [
	[ 'slug' => 'about',                      'title' => 'About Amida',           'template' => 'page-templates/landing.php',  'file' => null ],
	[ 'slug' => 'contact',                    'title' => 'Contact',               'template' => null,                          'file' => null ],
	[ 'slug' => 'login',                      'title' => 'Sign In',               'template' => 'page-templates/auth.php',     'file' => null ],
	[ 'slug' => 'register',                   'title' => 'Create Account',        'template' => 'page-templates/auth.php',     'file' => null ],
	[ 'slug' => 'forgot-password',            'title' => 'Forgot Password',       'template' => 'page-templates/auth.php',     'file' => null ],
	[ 'slug' => 'catalog',                    'title' => 'Catalog',               'template' => 'page-templates/catalog.php',  'file' => null ],
	[ 'slug' => 'account',                    'title' => 'Account',               'template' => 'page-templates/account.php',  'file' => null ],

	[ 'slug' => 'ruo-policy',                 'title' => 'Research Use Policy',   'template' => 'page-templates/legal.php',    'file' => 'ruo-policy.md' ],
	[ 'slug' => 'terms',                      'title' => 'Terms of Service',      'template' => 'page-templates/legal.php',    'file' => 'terms.md' ],
	[ 'slug' => 'privacy',                    'title' => 'Privacy Policy',        'template' => 'page-templates/legal.php',    'file' => 'privacy.md' ],
	[ 'slug' => 'shipping-policy',            'title' => 'Shipping Policy',       'template' => 'page-templates/legal.php',    'file' => 'shipping-policy.md' ],
	[ 'slug' => 'refund-policy',              'title' => 'Refund Policy',         'template' => 'page-templates/legal.php',    'file' => 'refund-policy.md' ],
	[ 'slug' => 'disclaimer',                 'title' => 'Disclaimer',            'template' => 'page-templates/legal.php',    'file' => 'disclaimer.md' ],
	[ 'slug' => 'age-verification-policy',    'title' => 'Age Verification',      'template' => 'page-templates/legal.php',    'file' => 'age-verification-policy.md' ],
];

$legal_dir = dirname( __DIR__ ) . '/legal';
$count = 0;

foreach ( $pages as $p ) {
	$content = '';
	if ( $p['file'] && file_exists( $legal_dir . '/' . $p['file'] ) ) {
		$content = file_get_contents( $legal_dir . '/' . $p['file'] );
	}

	$existing = get_page_by_path( $p['slug'] );
	$post_id  = $existing ? $existing->ID : 0;

	$post = [
		'ID'           => $post_id,
		'post_title'   => $p['title'],
		'post_name'    => $p['slug'],
		'post_content' => $content,
		'post_status'  => 'publish',
		'post_type'    => 'page',
	];

	$post_id = wp_insert_post( $post );

	if ( $p['template'] ) {
		update_post_meta( $post_id, '_wp_page_template', $p['template'] );
	}

	$count++;
	WP_CLI::log( sprintf( '[%-2d] /%-28s  %s', $count, $p['slug'], $p['title'] ) );
}

// Homepage flag — set front page to /about if you prefer; default uses latest-posts.
WP_CLI::success( sprintf( 'Seeded %d pages.', $count ) );
