<?php
/**
 * Custom roles: `researcher` (default post-registration) and
 * `verified_researcher` (Token-of-Trust stage 2).
 *
 * @package AmidaCompliance
 */

defined( 'ABSPATH' ) || exit;

class Amida_Roles {
	public const RESEARCHER          = 'researcher';
	public const VERIFIED_RESEARCHER = 'verified_researcher';

	public static function init(): void {
		add_filter( 'woocommerce_registration_redirect', [ __CLASS__, 'redirect_after_register' ] );
	}

	public static function install(): void {
		add_role( self::RESEARCHER, __( 'Researcher', 'amida-compliance' ), [
			'read'             => true,
			'view_shop'        => true,
			'download_coa'     => true,
		] );

		add_role( self::VERIFIED_RESEARCHER, __( 'Verified Researcher', 'amida-compliance' ), [
			'read'                 => true,
			'view_shop'            => true,
			'download_coa'         => true,
			'access_glp_products'  => true,
		] );

		// Make sure admins can also view GLP.
		$admin = get_role( 'administrator' );
		if ( $admin ) {
			$admin->add_cap( 'access_glp_products' );
			$admin->add_cap( 'view_shop' );
			$admin->add_cap( 'download_coa' );
		}
	}

	public static function is_researcher( int $user_id = 0 ): bool {
		$user = $user_id ? get_user_by( 'id', $user_id ) : wp_get_current_user();
		if ( ! $user || ! $user->exists() ) {
			return false;
		}
		return array_intersect( [ self::RESEARCHER, self::VERIFIED_RESEARCHER, 'administrator' ], (array) $user->roles ) !== [];
	}

	public static function redirect_after_register( string $url ): string {
		return home_url( '/catalog' );
	}
}
