<?php
/**
 * New account created — welcome email sent after successful registration.
 *
 * @package AmidaCompliance
 * @var WP_User $user
 * @var string  $set_password_url  One-time password-set link (WP native).
 */
defined( 'ABSPATH' ) || exit;
?>
<div style="background:#F5F0E8;padding:32px 0;font-family:Arial,Helvetica,sans-serif;color:#2A2A2A">
	<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" width="560" style="background:#FDFAF4;border-radius:14px;padding:32px">
		<tr>
			<td>
				<div style="font-family:Georgia,serif;font-size:32px;letter-spacing:.12em;color:#354535;text-align:center;margin-bottom:24px">AMIDA</div>

				<h2 style="font-family:Georgia,serif;font-weight:400;font-size:24px;color:#354535;margin:0 0 12px">Welcome to Amida Research.</h2>
				<p style="margin:0 0 18px;line-height:1.6;color:#2A2A2A">
					Hello <?php echo esc_html( $user->display_name ); ?>, your researcher account has been created. Set a password to complete your access.
				</p>

				<div style="text-align:center;margin:28px 0">
					<a href="<?php echo esc_url( $set_password_url ); ?>" style="display:inline-block;background:#354535;color:#F5F0E8;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:.14em;text-transform:uppercase;text-decoration:none;padding:0 28px;line-height:52px;border-radius:8px">Set Your Password</a>
				</div>

				<p style="margin:0 0 18px;font-size:13px;line-height:1.6;color:#8B7355">
					Username: <strong><?php echo esc_html( $user->user_login ); ?></strong><br>
					This link expires in 48 hours.
				</p>

				<p style="margin:0 0 18px;font-size:13px;line-height:1.6;color:#2A2A2A">
					Your account is pending email verification. Once verified, access to the full catalog will be granted subject to our Researcher Use Agreement.
				</p>

				<div style="margin-top:24px;padding:16px;background:rgba(193,125,60,.08);border-left:3px solid #C17D3C;border-radius:8px;font-size:13px;line-height:1.6;color:#8B7355">
					<strong style="color:#C17D3C;letter-spacing:.14em;text-transform:uppercase;font-size:11px">For Research Use Only</strong><br>
					Amida supplies research chemicals for laboratory and institutional use only. Not for human or animal consumption.
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
