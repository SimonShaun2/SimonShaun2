<?php
/**
 * Post-purchase upsell accepted confirmation email.
 *
 * Sent when a researcher accepts an OTO upsell during the CartFlows funnel.
 *
 * @package AmidaCompliance
 * @var WC_Order $order         Original parent order.
 * @var WC_Order $upsell_order  Upsell charge order (may be same order, depending on CF config).
 * @var array    $upsell_items  Array of WC_Order_Item_Product for the accepted upsell(s).
 * @var string   $upsell_label  Human-readable upsell title, e.g. "Exclusive Bundle Add-on".
 */
defined( 'ABSPATH' ) || exit;
?>
<div style="background:#F5F0E8;padding:32px 0;font-family:Arial,Helvetica,sans-serif;color:#2A2A2A">
	<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" width="560" style="background:#FDFAF4;border-radius:14px;padding:32px">
		<tr>
			<td>
				<div style="font-family:Georgia,serif;font-size:32px;letter-spacing:.12em;color:#354535;text-align:center;margin-bottom:24px">AMIDA</div>

				<h2 style="font-family:Georgia,serif;font-weight:400;font-size:24px;color:#354535;margin:0 0 12px">Add-on confirmed.</h2>
				<p style="margin:0 0 18px;line-height:1.6;color:#2A2A2A">
					Your add-on to order <strong>#<?php echo esc_html( $order->get_order_number() ); ?></strong> has been accepted and will ship together.
				</p>

				<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#F0EBE0;border-radius:8px;padding:20px;margin-bottom:24px">
					<tr>
						<td>
							<p style="margin:0 0 8px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#8B7355"><?php echo esc_html( $upsell_label ); ?></p>
							<?php foreach ( $upsell_items as $item ) : ?>
							<p style="margin:0 0 4px;font-size:15px;color:#354535;font-family:Georgia,serif"><?php echo esc_html( $item->get_name() ); ?> &times; <?php echo esc_html( $item->get_quantity() ); ?></p>
							<?php endforeach; ?>
							<p style="margin:8px 0 0;font-size:13px;color:#8B7355">
								Add-on total: <strong><?php echo wp_kses_post( wc_price( $upsell_order->get_total() ) ); ?></strong>
							</p>
						</td>
					</tr>
				</table>

				<p style="margin:0 0 18px;font-size:13px;line-height:1.6;color:#8B7355">
					The charge will appear on your statement as <strong><?php echo esc_html( defined( 'AMIDA_BILLING_DESCRIPTOR' ) ? AMIDA_BILLING_DESCRIPTOR : 'AMIDA RESEARCH' ); ?></strong>.
				</p>

				<div style="margin-top:24px;padding:16px;background:rgba(193,125,60,.08);border-left:3px solid #C17D3C;border-radius:8px;font-size:13px;line-height:1.6;color:#8B7355">
					<strong style="color:#C17D3C;letter-spacing:.14em;text-transform:uppercase;font-size:11px">For Research Use Only</strong><br>
					Not for human or animal consumption. Please handle in accordance with your institutional protocols.
				</div>

				<hr style="border:none;border-top:1px solid #DDD5C4;margin:28px 0">

				<p style="font-size:12px;color:#8B7355;line-height:1.6;margin:0">
					<strong><?php echo esc_html( defined( 'AMIDA_LEGAL_NAME' ) ? AMIDA_LEGAL_NAME : '' ); ?> (DBA <?php echo esc_html( defined( 'AMIDA_DBA' ) ? AMIDA_DBA : '' ); ?>)</strong><br>
					<?php echo esc_html( defined( 'AMIDA_ADDR_FULL' ) ? AMIDA_ADDR_FULL : '' ); ?><br>
					<?php echo esc_html( defined( 'AMIDA_SUPPORT_EMAIL' ) ? AMIDA_SUPPORT_EMAIL : '' ); ?>
				</p>
			</td>
		</tr>
	</table>
	<p style="text-align:center;font-size:11px;color:#9E9080;margin-top:16px">
		AM Holdings, LLC is a chemical supplier. Not a 503A or 503B facility.
	</p>
</div>
