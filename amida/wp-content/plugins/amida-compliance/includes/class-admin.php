<?php
/**
 * Admin UI for compliance ops.
 *
 * Top-level menu "Amida" with: Dashboard, Compliance Log, Batches, Exports,
 * NY Queue, Settings. Exports a CSV suitable for handing to processor
 * underwriting (Bankful, Easy Pay Direct, Corepay, etc.).
 *
 * @package AmidaCompliance
 */

defined( 'ABSPATH' ) || exit;

class Amida_Admin {

	public static function init(): void {
		add_action( 'admin_menu',          [ __CLASS__, 'register_menus' ] );
		add_action( 'admin_init',          [ __CLASS__, 'handle_export' ] );
		add_action( 'admin_enqueue_scripts', [ __CLASS__, 'enqueue' ] );
	}

	public static function register_menus(): void {
		$cap = 'manage_options';
		add_menu_page(
			__( 'Amida Compliance', 'amida-compliance' ),
			'Amida',
			$cap,
			'amida-compliance',
			[ __CLASS__, 'render_dashboard' ],
			'dashicons-shield-alt',
			58
		);

		add_submenu_page( 'amida-compliance', __( 'Dashboard',      'amida-compliance' ), __( 'Dashboard',      'amida-compliance' ), $cap, 'amida-compliance',         [ __CLASS__, 'render_dashboard' ] );
		add_submenu_page( 'amida-compliance', __( 'Compliance Log', 'amida-compliance' ), __( 'Compliance Log', 'amida-compliance' ), $cap, 'amida-compliance-log',     [ __CLASS__, 'render_log' ] );
		add_submenu_page( 'amida-compliance', __( 'Batch Log',      'amida-compliance' ), __( 'Batch Log',      'amida-compliance' ), $cap, 'amida-compliance-batches', [ __CLASS__, 'render_batches' ] );
		add_submenu_page( 'amida-compliance', __( 'Exports',        'amida-compliance' ), __( 'Exports',        'amida-compliance' ), $cap, 'amida-compliance-exports', [ __CLASS__, 'render_exports' ] );
		add_submenu_page( 'amida-compliance', __( 'NY Queue',       'amida-compliance' ), __( 'NY Enhanced',    'amida-compliance' ), $cap, 'amida-compliance-ny',      [ __CLASS__, 'render_ny' ] );
		add_submenu_page( 'amida-compliance', __( 'Settings',       'amida-compliance' ), __( 'Settings',       'amida-compliance' ), $cap, 'amida-compliance-settings',[ __CLASS__, 'render_settings' ] );
	}

	public static function enqueue( string $hook ): void {
		if ( false === strpos( $hook, 'amida-compliance' ) ) {
			return;
		}
		wp_enqueue_style( 'amida-compl-admin', AMIDA_COMPL_URL . 'assets/css/admin.css', [], AMIDA_COMPL_VERSION );
	}

	public static function render_dashboard(): void {
		global $wpdb;
		$counts = (array) $wpdb->get_results(
			"SELECT event_type, COUNT(*) AS n
			 FROM {$wpdb->prefix}amida_compliance_log
			 WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
			 GROUP BY event_type
			 ORDER BY n DESC"
		);
		include AMIDA_COMPL_DIR . 'admin/views/dashboard.php';
	}

	public static function render_log(): void {
		$events = Amida_Compliance_Log::query( [
			'event_type' => sanitize_text_field( $_GET['event'] ?? '' ) ?: null,
			'state'      => sanitize_text_field( $_GET['state'] ?? '' ) ?: null,
			'limit'      => 200,
		] );
		include AMIDA_COMPL_DIR . 'admin/views/log.php';
	}

	public static function render_batches(): void {
		global $wpdb;
		$batches = (array) $wpdb->get_results( "SELECT * FROM {$wpdb->prefix}amida_batch_log ORDER BY id DESC LIMIT 500" );
		include AMIDA_COMPL_DIR . 'admin/views/batches.php';
	}

	public static function render_exports(): void {
		include AMIDA_COMPL_DIR . 'admin/views/exports.php';
	}

	public static function render_ny(): void {
		$events = Amida_Compliance_Log::query( [ 'state' => 'NY', 'limit' => 200 ] );
		include AMIDA_COMPL_DIR . 'admin/views/ny-queue.php';
	}

	public static function render_settings(): void {
		include AMIDA_COMPL_DIR . 'admin/views/settings.php';
	}

	/**
	 * CSV export. Hit /wp-admin/admin.php?page=amida-compliance-exports&run=csv&days=30
	 */
	public static function handle_export(): void {
		if ( empty( $_GET['page'] ) || 'amida-compliance-exports' !== $_GET['page'] ) {
			return;
		}
		if ( empty( $_GET['run'] ) || 'csv' !== $_GET['run'] ) {
			return;
		}
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( 'Denied.' );
		}
		check_admin_referer( 'amida_export' );

		$days = max( 1, min( 365, (int) ( $_GET['days'] ?? 30 ) ) );
		$rows = Amida_Compliance_Log::query( [
			'since' => gmdate( 'Y-m-d H:i:s', time() - $days * DAY_IN_SECONDS ),
			'limit' => 50000,
		] );

		nocache_headers();
		header( 'Content-Type: text/csv; charset=utf-8' );
		header( sprintf( 'Content-Disposition: attachment; filename="amida-compliance-%s-%sd.csv"', gmdate( 'Ymd' ), $days ) );

		$out = fopen( 'php://output', 'w' );
		fputcsv( $out, [ 'id', 'created_at', 'user_id', 'session_id', 'event_type', 'state_code', 'enhanced_flow', 'ip_hash', 'event_data' ] );
		foreach ( $rows as $r ) {
			fputcsv( $out, [
				$r->id,
				$r->created_at,
				$r->user_id,
				$r->session_id,
				$r->event_type,
				$r->state_code,
				$r->enhanced_flow_triggered,
				$r->ip_hash,
				$r->event_data,
			] );
		}
		fclose( $out );
		exit;
	}
}
