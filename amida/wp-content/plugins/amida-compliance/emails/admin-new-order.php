<?php
/**
 * Admin new-order notification email.
 *
 * Sent to the store admin email on every new order placement.
 *
 * @package AmidaCompliance
 * @var WC_Order $order
 * @var string   $admin_url  WC order edit URL.
 */
defined( 'ABSPATH' ) || exit;
$billing = $order->get_address( 'billing' );
?>
<div style="background:#F5F0E8;padding:32px 0;font-family:Arial,Helvetica,sans-serif;color:#2A2A2A">
	<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" width="560" style="background:#FDFAF4;border-radius:14px;padding:32px">
		<tr>
			<td>
				<div style="font-family:Georgia,serif;font-size:32px;letter-spacing:.12em;color:#354535;text-align:center;margin-bottom:24px">AMIDA — Admin</div>

				<h2 style="font-family:Georgia,serif;font-weight:400;font-size:24px;color:#354535;margin:0 0 12px">New order received.</h2>

				<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#F0EBE0;border-radius:8px;padding:20px;margin-bottom:24px">
					<tr>
						<td style="padding-bottom:8px">
							<span style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#8B7355">Order</span><br>
							<strong style="font-size:16px;color:#354535">#<?php echo esc_html( $order->get_order_number() ); ?></strong>
						</td>
						<td style="padding-bottom:8px;text-align:right">
							<span style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#8B7355">Total</span><br>
							<strong style="font-size:16px;color:#354535"><?php echo wp_kses_post( wc_price( $order->get_total() ) ); ?></strong>
						</td>
					</tr>
					<tr>
						<td colspan="2" style="padding-top:12px;border-top:1px solid #DDD5C4">
							<span style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#8B7355">Customer</span><br>
							<?php echo esc_html( $billing['first_name'] . ' ' . $billing['last_name'] ); ?><br>
							<span style="font-size:13px;color:#8B7355"><?php echo esc_html( $billing['email'] ); ?></span>
						</td>
					</tr>
					<tr>
						<td colspan="2" style="padding-top:12px">
							<span style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#8B7355">Ship to</span><br>
							<?php
							$ship = $order->get_address( 'shipping' );
							echo esc_html( $ship['address_1'] );
							if ( $ship['address_2'] ) {
								echo ', ' . esc_html( $ship['address_2'] );
							}
							echo '<br>' . esc_html( $ship['city'] . ', ' . $ship['state'] . ' ' . $ship['postcode'] );
							?>
						</td>
					</tr>
				</table>

				<h3 style="font-family:Georgia,serif;font-weight:400;font-size:16px;color:#354535;margin:0 0 12px">Items</h3>
				<?php foreach ( $order->get_items() as $item ) : ?>
				<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:8px">
					<tr>
						<td style="font-size:14px;color:#2A2A2A"><?php echo esc_html( $item->get_name() ); ?></td>
						<td style="font-size:14px;color:#8B7355;text-align:right">&times;<?php echo esc_html( $item->get_quantity() ); ?> — <?php echo wp_kses_post( wc_price( $item->get_total() ) ); ?></td>
					</tr>
				</table>
				<?php endforeach; ?>

				<div style="text-align:center;margin:28px 0">
					<a href="<?php echo esc_url( $admin_url ); ?>" style="display:inline-block;background:#354535;color:#F5F0E8;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:.14em;text-transform:uppercase;text-decoration:none;padding:0 28px;line-height:52px;border-radius:8px">View Order</a>
				</div>

				<div style="margin-top:8px;padding:16px;background:rgba(193,125,60,.08);border-left:3px solid #C17D3C;border-radius:8px;font-size:13px;line-height:1.6;color:#8B7355">
					<strong style="color:#C17D3C;letter-spacing:.14em;text-transform:uppercase;font-size:11px">Compliance reminder</strong><br>
					Verify researcher attestation on file before fulfillment. Do not ship to restricted states without state-specific review.
				</div>

				<hr style="border:none;border-top:1px solid #DDD5C4;margin:28px 0">

				<p style="font-size:12px;color:#8B7355;line-height:1.6;margin:0">
					<strong><?php echo esc_html( defined( 'AMIDA_LEGAL_NAME' ) ? AMIDA_LEGAL_NAME : '' ); ?></strong> — internal notification<br>
					<?php echo esc_html( defined( 'AMIDA_ADDR_FULL' ) ? AMIDA_ADDR_FULL : '' ); ?>
				</p>
			</td>
		</tr>
	</table>
</div>
