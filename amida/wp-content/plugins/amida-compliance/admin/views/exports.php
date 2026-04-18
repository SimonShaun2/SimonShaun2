<?php
/**
 * @package AmidaCompliance
 */
defined( 'ABSPATH' ) || exit;
?>
<div class="wrap amida-compl">
	<h1><?php esc_html_e( 'Compliance Exports', 'amida-compliance' ); ?></h1>
	<p class="description"><?php esc_html_e( 'CSV export of compliance log events. Hand this to your payment processor on request.', 'amida-compliance' ); ?></p>

	<form method="get" action="<?php echo esc_url( admin_url( 'admin.php' ) ); ?>" style="margin-top:16px">
		<input type="hidden" name="page" value="amida-compliance-exports">
		<input type="hidden" name="run"  value="csv">
		<?php wp_nonce_field( 'amida_export' ); ?>
		<label><?php esc_html_e( 'Days back:', 'amida-compliance' ); ?>
			<select name="days">
				<option value="30">30</option>
				<option value="60">60</option>
				<option value="90">90</option>
				<option value="180">180</option>
				<option value="365">365</option>
			</select>
		</label>
		<button class="button button-primary"><?php esc_html_e( 'Download CSV', 'amida-compliance' ); ?></button>
	</form>
</div>
