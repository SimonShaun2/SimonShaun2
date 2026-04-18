<?php
/**
 * Batch log — ties shipped orders to specific product batches and their
 * COA URLs. Used by the COA library in /account/coa-library and by the
 * admin "Batch Log" report.
 *
 * @package AmidaCompliance
 */

defined( 'ABSPATH' ) || exit;

class Amida_Batch_Log {

	public static function init(): void {
		add_action( 'woocommerce_order_status_completed', [ __CLASS__, 'record_batches' ] );
	}

	public static function record_batches( int $order_id ): void {
		$order = wc_get_order( $order_id );
		if ( ! $order ) {
			return;
		}
		global $wpdb;

		foreach ( $order->get_items() as $item ) {
			if ( ! $item instanceof WC_Order_Item_Product ) {
				continue;
			}
			$pid   = (int) $item->get_product_id();
			$batch = (string) get_post_meta( $pid, '_amida_batch', true );
			$coa   = (string) get_post_meta( $pid, '_amida_coa_url', true );
			if ( '' === $batch ) {
				continue;
			}

			$wpdb->insert(
				$wpdb->prefix . 'amida_batch_log',
				[
					'order_id'     => $order_id,
					'product_id'   => $pid,
					'batch_number' => $batch,
					'coa_file_url' => $coa,
					'shipped_at'   => current_time( 'mysql', true ),
				],
				[ '%d', '%d', '%s', '%s', '%s' ]
			);
		}
	}

	public static function get_user_coas( int $user_id ): array {
		global $wpdb;
		$sql = "SELECT bl.* FROM {$wpdb->prefix}amida_batch_log bl
				INNER JOIN {$wpdb->prefix}wc_orders o ON o.id = bl.order_id
				WHERE o.customer_id = %d
				ORDER BY bl.shipped_at DESC";
		return (array) $wpdb->get_results( $wpdb->prepare( $sql, $user_id ) );
	}
}
