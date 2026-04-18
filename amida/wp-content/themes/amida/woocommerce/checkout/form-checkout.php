<?php
/**
 * Amida checkout form — 4-step linear layout. CartFlows/FunnelKit replaces
 * this in production with a multi-page funnel; this fallback keeps parity
 * if the plugin is missing or disabled in staging.
 *
 * @package Amida
 */

defined( 'ABSPATH' ) || exit;

if ( ! is_ajax() ) {
	do_action( 'woocommerce_before_checkout_form', $checkout );
}

if ( ! $checkout->is_registration_enabled() && $checkout->is_registration_required() && ! is_user_logged_in() ) {
	echo esc_html( apply_filters( 'woocommerce_checkout_must_be_logged_in_message', __( 'You must be logged in to checkout.', 'woocommerce' ) ) );
	return;
}
?>

<form name="checkout" method="post" class="checkout woocommerce-checkout" action="<?php echo esc_url( wc_get_checkout_url() ); ?>" enctype="multipart/form-data" aria-label="Checkout">
	<nav aria-label="<?php esc_attr_e( 'Checkout progress', 'amida' ); ?>" style="display:flex;gap:8px;margin-bottom:24px">
		<?php foreach ( [
			[ 'key' => 'identity', 'label' => __( '1. Identity', 'amida' ) ],
			[ 'key' => 'shipping', 'label' => __( '2. Shipping', 'amida' ) ],
			[ 'key' => 'payment',  'label' => __( '3. Payment', 'amida' ) ],
			[ 'key' => 'review',   'label' => __( '4. Review', 'amida' ) ],
		] as $step ) : ?>
			<div class="checkout-step" style="flex:1;padding:10px 8px;text-align:center;border-bottom:2px solid var(--border);font-size:.78rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)">
				<?php echo esc_html( $step['label'] ); ?>
			</div>
		<?php endforeach; ?>
	</nav>

	<?php if ( $checkout->get_checkout_fields() ) : ?>
		<?php do_action( 'woocommerce_checkout_before_customer_details' ); ?>

		<div class="col2-set" id="customer_details" style="display:grid;grid-template-columns:1.2fr 1fr;gap:40px">
			<div class="col-1">
				<?php do_action( 'woocommerce_checkout_billing' ); ?>
			</div>

			<div class="col-2">
				<?php do_action( 'woocommerce_checkout_shipping' ); ?>
			</div>
		</div>

		<?php do_action( 'woocommerce_checkout_after_customer_details' ); ?>
	<?php endif; ?>

	<h3 id="order_review_heading" style="margin-top:32px"><?php esc_html_e( 'Review & Pay', 'woocommerce' ); ?></h3>

	<?php do_action( 'woocommerce_checkout_before_order_review_heading' ); ?>
	<?php do_action( 'woocommerce_checkout_before_order_review' ); ?>

	<div id="order_review" class="woocommerce-checkout-review-order">
		<?php do_action( 'woocommerce_checkout_order_review' ); ?>
	</div>

	<?php do_action( 'woocommerce_checkout_after_order_review' ); ?>

	<p style="margin-top:16px;padding:12px 16px;background:var(--cream-deep);border-radius:10px;font-size:.82rem;color:var(--warm)">
		<?php printf(
			esc_html__( 'Your statement will show "%s". All sales final. Domestic shipping only.', 'amida' ),
			esc_html( defined( 'AMIDA_BILLING_DESCRIPTOR' ) ? AMIDA_BILLING_DESCRIPTOR : 'AMIDA RESEARCH' )
		); ?>
	</p>
</form>

<?php do_action( 'woocommerce_after_checkout_form', $checkout ); ?>
