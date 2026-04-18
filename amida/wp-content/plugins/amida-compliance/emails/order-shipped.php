<?php
/**
 * Order shipped / tracking notification email.
 *
 * @package AmidaCompliance
 * @var WC_Order $order
 * @var string   $tracking_number  May be empty if not yet available.
 * @var string   $carrier          Carrier display name, e.g. "FedEx".
 * @var string   $tracking_url     Full tracking URL or empty string.
 */
defined( 'ABSPATH' ) || exit;
?>
<div style="background:#F5F0E8;padding:32px 0;font-family:Arial,Helvetica,sans-serif;color:#2A2A2A">
	<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" width="560" style="background:#FDFAF4;border-radius:14px;padding:32px">
		<tr>
			<td>
				<div style="font-family:Georgia,serif;font-size:32px;letter-spacing:.12em;color:#354535;text-align:center;margin-bottom:24px">AMIDA</div>

				<h2 style="font-family:Georgia,serif;font-weight:400;font-size:24px;color:#354535;margin:0 0 12px">Your order has shipped.</h2>
				<p style="margin:0 0 18px;line-height:1.6;color:#2A2A2A">
					Order <strong>#<?php echo esc_html( $order->get_order_number() ); ?></strong> is on its way.
				</p>

				<?php if ( $tracking_number ) : ?>
				<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#F0EBE0;border-radius:8px;padding:20px;margin-bottom:24px">
					<tr>
						<td>
							<p style="margin:0 0 6px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#8B7355">Tracking</p>
							<p style="margin:0;font-size:18px;font-family:Georgia,serif;color:#354535">
								<?php if ( $tracking_url ) : ?>
									<a href="<?php echo esc_url( $tracking_url ); ?>" style="color:#354535;text-decoration:none"><?php echo esc_html( $tracking_number ); ?></a>
								<?php else : ?>
									<?php echo esc_html( $tracking_number ); ?>
								<?php endif; ?>
							</p>
							<?php if ( $carrier ) : ?>
							<p style="margin:4px 0 0;font-size:13px;color:#8B7355"><?php echo esc_html( $carrier ); ?></p>
							<?php endif; ?>
						</td>
					</tr>
				</table>
				<?php endif; ?>

				<?php if ( $tracking_url ) : ?>
				<div style="text-align:center;margin:28px 0">
					<a href="<?php echo esc_url( $tracking_url ); ?>" style="display:inline-block;background:#354535;color:#F5F0E8;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:.14em;text-transform:uppercase;text-decoration:none;padding:0 28px;line-height:52px;border-radius:8px">Track Shipment</a>
				</div>
				<?php endif; ?>

				<p style="margin:0 0 18px;font-size:13px;line-height:1.6;color:#8B7355">
					All shipments are discreetly packaged. The billing descriptor on your statement will read <strong><?php echo esc_html( defined( 'AMIDA_BILLING_DESCRIPTOR' ) ? AMIDA_BILLING_DESCRIPTOR : 'AMIDA RESEARCH' ); ?></strong>.
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
