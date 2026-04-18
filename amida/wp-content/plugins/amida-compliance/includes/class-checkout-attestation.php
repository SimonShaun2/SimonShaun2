<?php
/**
 * Checkout-time RUO re-attestation. Adds a required checkbox at step 3,
 * logs `checkout_initiated` + `checkout_attested` + `order_placed` events.
 *
 * @package AmidaCompliance
 */

defined( 'ABSPATH' ) || exit;

class Amida_Checkout_Attestation {

	public static function init(): void {
		add_action( 'woocommerce_before_checkout_form',   [ __CLASS__, 'log_checkout_initiated' ] );
		add_action( 'woocommerce_review_order_before_submit', [ __CLASS__, 'render_checkbox' ] );
		add_action( 'woocommerce_checkout_process',       [ __CLASS__, 'require_checkbox' ] );
		add_action( 'woocommerce_checkout_order_created', [ __CLASS__, 'on_order_placed' ] );
	}

	public static function log_checkout_initiated(): void {
		if ( ! function_exists( 'WC' ) || ! WC()->cart ) {
			return;
		}
		Amida_Compliance_Log::log(
			'checkout_initiated',
			[ 'cart_total' => (float) WC()->cart->get_total( 'edit' ) ],
			get_current_user_id() ?: null,
			(string) get_user_meta( get_current_user_id(), 'amida_state', true )
		);
	}

	public static function render_checkbox(): void {
		?>
		<div class="ruo-notice" style="margin:18px 0">
			<strong><?php esc_html_e( 'Final Research-Use Attestation', 'amida-compliance' ); ?></strong>
			<label class="checkbox-row" style="margin-top:10px">
				<input type="checkbox" name="amida_checkout_ruo" id="amida_checkout_ruo" value="1" required>
				<span style="font-size:.88rem">
					<?php
					printf(
						esc_html__( 'I certify under penalty of perjury that I am at least %1$d, that the above items are purchased for research use only and will not be administered to humans or animals, and that %2$s bears no liability for post-purchase handling.', 'amida-compliance' ),
						(int) AMIDA_MIN_AGE,
						esc_html( AMIDA_LEGAL_NAME )
					);
					?>
				</span>
			</label>
		</div>
		<?php
	}

	public static function require_checkbox(): void {
		if ( empty( $_POST['amida_checkout_ruo'] ) ) {
			wc_add_notice( __( 'Research-use attestation is required to complete your order.', 'amida-compliance' ), 'error' );
		}
	}

	public static function on_order_placed( $order ): void {
		if ( ! $order instanceof WC_Order ) {
			return;
		}
		$user_id = $order->get_user_id();
		$state   = $order->get_billing_state();

		Amida_Compliance_Log::log(
			'checkout_attested',
			[ 'order_id' => $order->get_id(), 'attested' => true ],
			$user_id ?: null,
			$state
		);

		Amida_Compliance_Log::log(
			'order_placed',
			[
				'order_id' => $order->get_id(),
				'total'    => (float) $order->get_total(),
				'items'    => array_map(
					static fn( WC_Order_Item_Product $i ) => [
						'product_id' => $i->get_product_id(),
						'qty'        => (int) $i->get_quantity(),
						'subtotal'   => (float) $i->get_subtotal(),
					],
					$order->get_items()
				),
				'compliance_snapshot' => [
					'age_method'    => AMIDA_ATTEST_METHOD,
					'ruo_at'        => current_time( 'mysql', true ),
					'billing_state' => $state,
				],
			],
			$user_id ?: null,
			$state
		);
	}
}
