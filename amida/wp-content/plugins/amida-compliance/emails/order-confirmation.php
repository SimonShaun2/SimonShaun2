<?php
/**
 * Order confirmation email. Replaces WC default HTML body for the
 * `woocommerce_email_order_details` hook when we want full brand control.
 *
 * @package AmidaCompliance
 * @var WC_Order $order
 */
defined( 'ABSPATH' ) || exit;
?>
<div style="background:#F5F0E8;padding:32px 0;font-family:Arial,Helvetica,sans-serif;color:#2A2A2A">
	<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" width="560" style="background:#FDFAF4;border-radius:14px;padding:32px">
		<tr>
			<td>
				<div style="font-family:Georgia,serif;font-size:32px;letter-spacing:.12em;color:#354535;text-align:center;margin-bottom:24px">AMIDA</div>

				<h2 style="font-family:Georgia,serif;font-weight:400;font-size:24px;color:#354535;margin:0 0 12px">Thank you for your research order.</h2>
				<p style="margin:0 0 18px;line-height:1.6;color:#2A2A2A">
					Order <strong>#<?php echo esc_html( $order->get_order_number() ); ?></strong> placed on <?php echo esc_html( wc_format_datetime( $order->get_date_created() ) ); ?>.
				</p>

				<?php do_action( 'woocommerce_email_order_details', $order, false, false, '' ); ?>

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
