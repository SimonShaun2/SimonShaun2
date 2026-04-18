<?php
/**
 * WP-CLI catalog seeder.
 *
 * Loads /scripts/products.csv and creates WooCommerce products with Amida
 * compliance meta (real_compound, tiered pack prices, CAS, formula, purity,
 * batch placeholder). Safe to re-run — upserts by SKU.
 *
 * Usage:
 *   wp eval-file wp-content/../scripts/seed-catalog.php
 *
 * @package AmidaSeed
 */

defined( 'WP_CLI' ) || exit( "Run via wp-cli only.\n" );

if ( ! class_exists( 'WooCommerce' ) ) {
	WP_CLI::error( 'WooCommerce is not active.' );
}

$csv = __DIR__ . '/products.csv';
if ( ! file_exists( $csv ) ) {
	WP_CLI::error( "products.csv not found at $csv" );
}

$rows = array_map( 'str_getcsv', file( $csv ) );
$head = array_map( 'trim', array_shift( $rows ) );

$categories = [];
$created = $updated = 0;

foreach ( $rows as $row ) {
	if ( count( $row ) < count( $head ) ) {
		continue;
	}
	$r = array_combine( $head, $row );

	$sku          = trim( $r['SKU'] );
	$name         = trim( $r['Display Name'] );
	$real         = trim( $r['Real Name'] );
	$cat_name     = trim( $r['Category'] );
	$purity       = trim( $r['Purity'] );
	$single       = (float) $r['Single'];
	$pack3        = (float) ( $r['Pack3'] ?? 0 );
	$pack5        = (float) ( $r['Pack5'] ?? 0 );
	$pack10       = (float) ( $r['Pack10'] ?? 0 );
	$cas          = trim( $r['CAS'] );
	$formula      = trim( $r['Formula'] );
	$size         = trim( $r['Size'] );

	// Find existing by SKU.
	$product_id   = wc_get_product_id_by_sku( $sku );
	$product      = $product_id ? wc_get_product( $product_id ) : new WC_Product_Simple();

	$product->set_name( $name );
	$product->set_sku( $sku );
	$product->set_regular_price( $single );
	$product->set_price( $single );
	$product->set_status( 'publish' );
	$product->set_catalog_visibility( 'catalog' );
	$product->set_short_description( amida_seed_short_desc( $name, $size, $purity ) );
	$product->set_description( amida_seed_long_desc( $name, $cat_name ) );
	$product->set_virtual( false );
	$product->set_manage_stock( false );
	$product->set_stock_status( 'instock' );

	// Category.
	if ( $cat_name ) {
		if ( ! isset( $categories[ $cat_name ] ) ) {
			$term = term_exists( $cat_name, 'product_cat' );
			if ( ! $term ) {
				$term = wp_insert_term( $cat_name, 'product_cat' );
			}
			$categories[ $cat_name ] = is_wp_error( $term ) ? 0 : (int) $term['term_id'];
		}
		if ( $categories[ $cat_name ] ) {
			$product->set_category_ids( [ $categories[ $cat_name ] ] );
		}
	}

	$product_id = $product->save();

	update_post_meta( $product_id, '_amida_real_compound', $real );
	update_post_meta( $product_id, '_amida_cas',           $cas );
	update_post_meta( $product_id, '_amida_formula',       $formula );
	update_post_meta( $product_id, '_amida_purity',        $purity );
	update_post_meta( $product_id, '_amida_size',          $size );
	update_post_meta( $product_id, '_amida_batch',         amida_seed_batch( $sku ) );
	update_post_meta( $product_id, '_amida_pack_3',        $pack3 );
	update_post_meta( $product_id, '_amida_pack_5',        $pack5 );
	update_post_meta( $product_id, '_amida_pack_10',       $pack10 );

	WP_CLI::log( sprintf( '%-14s  %-30s  $%s', $sku, $name, $single ) );
	$product_id && ( $product ? $updated++ : $created++ );
}

WP_CLI::success( sprintf( 'Seed complete. Created/updated: %d categories, %d products.', count( $categories ), count( $rows ) ) );

/* Helpers ------------------------------------------------------------- */

function amida_seed_short_desc( string $name, string $size, string $purity ): string {
	return sprintf(
		'%1$s — %2$s, %3$s HPLC. Batch-specific Certificate of Analysis. For research use only.',
		esc_html( $name ),
		esc_html( $size ),
		esc_html( $purity )
	);
}

function amida_seed_long_desc( string $name, string $category ): string {
	return sprintf(
		'%1$s is a synthetic research compound in the %2$s family. Sold exclusively for laboratory and in-vitro research. Every vial ships with a batch-specific Certificate of Analysis. %3$s is a chemical supplier, not a compounding pharmacy or outsourcing facility. Not for human or animal consumption.',
		esc_html( $name ),
		esc_html( $category ),
		esc_html( AMIDA_LEGAL_NAME )
	);
}

function amida_seed_batch( string $sku ): string {
	return strtoupper( substr( str_replace( '-', '', $sku ), 0, 6 ) ) . '-' . gmdate( 'ym' ) . wp_rand( 10, 99 );
}
