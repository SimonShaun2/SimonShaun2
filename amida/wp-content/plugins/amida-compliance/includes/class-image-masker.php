<?php
/**
 * Compound-name image masker.
 *
 * Real compound names (Retatrutide, Tirzepatide, Semaglutide, ...) must NEVER
 * appear as crawlable text on the site. When a product is saved with the meta
 * key `_amida_real_compound`, this class generates a rasterized PNG version
 * of that name and stores it under /wp-content/uploads/compound-names/.
 *
 * Serving is done via a PHP proxy that (1) requires an authenticated
 * researcher, (2) sets Cache-Control: private, no-store, (3) logs a
 * `product_viewed` event.
 *
 * @package AmidaCompliance
 */

defined( 'ABSPATH' ) || exit;

class Amida_Image_Masker {

	public const META_REAL_NAME = '_amida_real_compound';
	public const META_IMG_PATH  = '_amida_compound_image';
	public const REWRITE_SLUG   = 'compound-img';

	public static function init(): void {
		add_action( 'save_post_product',           [ __CLASS__, 'maybe_generate_for_product' ], 20, 2 );
		add_filter( 'amida/compound_name_image',   [ __CLASS__, 'get_proxy_url' ], 10, 3 );
		add_action( 'init',                        [ __CLASS__, 'register_rewrite' ] );
		add_filter( 'query_vars',                  [ __CLASS__, 'query_vars' ] );
		add_action( 'template_redirect',           [ __CLASS__, 'maybe_serve_image' ] );
	}

	public static function query_vars( array $vars ): array {
		$vars[] = 'amida_compound_hash';
		return $vars;
	}

	public static function register_rewrite(): void {
		add_rewrite_rule( '^compound-img/([a-f0-9]{8,})\.png$', 'index.php?amida_compound_hash=$matches[1]', 'top' );
	}

	public static function get_uploads_dir(): string {
		$base = wp_get_upload_dir();
		$dir  = trailingslashit( $base['basedir'] ) . 'compound-names';
		if ( ! file_exists( $dir ) ) {
			wp_mkdir_p( $dir );
			// Lock down with an .htaccess deny-all (served only via proxy).
			file_put_contents( $dir . '/.htaccess', "Require all denied\n" );
			file_put_contents( $dir . '/index.html', '' );
		}
		return $dir;
	}

	/**
	 * Public API: given a product id and real name, return a URL that proxies
	 * the rasterized compound-name image (or empty string if unavailable).
	 */
	public static function get_proxy_url( string $default, int $product_id, string $real_name ): string {
		if ( ! AMIDA_IMAGE_MASK_ENABLED ) {
			return $default;
		}
		$path = get_post_meta( $product_id, self::META_IMG_PATH, true );
		if ( ! $path ) {
			$path = self::generate_png( $product_id, $real_name );
		}
		if ( ! $path ) {
			return $default;
		}
		$hash = basename( $path, '.png' );
		return home_url( self::REWRITE_SLUG . '/' . $hash . '.png' );
	}

	/**
	 * Hook: generate (or refresh) the PNG when a product is saved. Inspects
	 * the saved real-compound meta.
	 */
	public static function maybe_generate_for_product( int $post_id, WP_Post $post ): void {
		if ( wp_is_post_revision( $post_id ) ) {
			return;
		}
		$name = (string) get_post_meta( $post_id, self::META_REAL_NAME, true );
		if ( '' === $name ) {
			return;
		}
		self::generate_png( $post_id, $name );
	}

	/**
	 * Rasterize the real name to PNG. Uses GD (part of every WP install) so
	 * we don't hard-require ImageMagick. EXIF is naturally stripped.
	 */
	public static function generate_png( int $product_id, string $real_name ): ?string {
		$dir  = self::get_uploads_dir();
		$hash = substr( hash( 'sha256', $real_name . '|' . $product_id . '|' . wp_salt() ), 0, 16 );
		$file = $dir . '/cn_' . $hash . '.png';

		if ( ! function_exists( 'imagecreatetruecolor' ) ) {
			return null;
		}

		$width  = 600;
		$height = 180;
		$img    = imagecreatetruecolor( $width, $height );
		$bg     = imagecolorallocate( $img, 245, 240, 232 ); // --cream
		$fg     = imagecolorallocate( $img, 53, 69, 53 );    // --sage-deep
		$mute   = imagecolorallocate( $img, 155, 144, 128 );
		imagefilledrectangle( $img, 0, 0, $width, $height, $bg );

		// Try a bundled TTF; fall back to GD builtin if unavailable.
		$font = AMIDA_COMPL_DIR . 'assets/fonts/Cormorant-Medium.ttf';
		if ( file_exists( $font ) && function_exists( 'imagettftext' ) ) {
			imagettftext( $img, 30, 0, 24, 60, $fg, $font, $real_name );
			imagettftext( $img, 13, 0, 24, 95, $mute, $font, 'CAS · Batch-verified · Lyophilized' );
		} else {
			imagestring( $img, 5, 24, 40, $real_name, $fg );
			imagestring( $img, 2, 24, 80, 'Batch-verified research compound', $mute );
		}

		imagepng( $img, $file, 9 );
		imagedestroy( $img );

		update_post_meta( $product_id, self::META_IMG_PATH, $file );
		return $file;
	}

	/**
	 * Serve the image through the proxy. Enforces authentication, sets
	 * no-store, logs the product_viewed event.
	 */
	public static function maybe_serve_image(): void {
		$hash = get_query_var( 'amida_compound_hash' );
		if ( ! $hash ) {
			return;
		}

		if ( ! is_user_logged_in() ) {
			status_header( 403 );
			exit;
		}

		$path = self::get_uploads_dir() . '/cn_' . preg_replace( '/[^a-f0-9]/i', '', $hash ) . '.png';
		if ( ! file_exists( $path ) ) {
			status_header( 404 );
			exit;
		}

		// Look up the product via image meta.
		global $wpdb;
		$product_id = (int) $wpdb->get_var( $wpdb->prepare(
			"SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = %s AND meta_value = %s LIMIT 1",
			self::META_IMG_PATH,
			$path
		) );
		if ( $product_id ) {
			Amida_Compliance_Log::log( 'product_viewed', [ 'product_id' => $product_id ] );
		}

		status_header( 200 );
		header( 'Content-Type: image/png' );
		header( 'Cache-Control: private, no-store, max-age=0' );
		header( 'Pragma: no-cache' );
		header( 'X-Content-Type-Options: nosniff' );
		header( 'Content-Length: ' . filesize( $path ) );
		readfile( $path );
		exit;
	}
}
