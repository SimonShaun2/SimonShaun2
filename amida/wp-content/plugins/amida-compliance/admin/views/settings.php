<?php
/**
 * @package AmidaCompliance
 */
defined( 'ABSPATH' ) || exit;
?>
<div class="wrap amida-compl">
	<h1><?php esc_html_e( 'Amida Compliance Settings', 'amida-compliance' ); ?></h1>

	<h2><?php esc_html_e( 'Brand constants', 'amida-compliance' ); ?></h2>
	<p class="description"><?php esc_html_e( 'Edit /wp-content/mu-plugins/amida-brand.php to change these — they are not editable from the admin UI.', 'amida-compliance' ); ?></p>
	<table class="widefat striped" style="max-width:760px;margin-top:12px">
		<tbody>
			<tr><th>Legal name</th><td><code><?php echo esc_html( AMIDA_LEGAL_NAME ); ?></code></td></tr>
			<tr><th>DBA</th><td><code><?php echo esc_html( AMIDA_DBA ); ?></code></td></tr>
			<tr><th>Address</th><td><code><?php echo esc_html( AMIDA_ADDR_FULL ); ?></code></td></tr>
			<tr><th>Support email</th><td><code><?php echo esc_html( AMIDA_SUPPORT_EMAIL ); ?></code></td></tr>
			<tr><th>Processor</th><td><code><?php echo esc_html( AMIDA_PROCESSOR ); ?></code></td></tr>
			<tr><th>Billing descriptor</th><td><code><?php echo esc_html( AMIDA_BILLING_DESCRIPTOR ); ?></code></td></tr>
			<tr><th>Free shipping threshold</th><td><code>$<?php echo esc_html( AMIDA_FREE_SHIPPING_THRESHOLD ); ?></code></td></tr>
			<tr><th>Enhanced flow states</th><td><code><?php echo esc_html( implode( ', ', (array) maybe_unserialize( AMIDA_ENHANCED_FLOW_STATES ) ) ); ?></code></td></tr>
			<tr><th>Public catalog</th><td><code><?php echo AMIDA_PUBLIC_CATALOG_ENABLED ? 'ENABLED — MUST BE FALSE AT LAUNCH' : 'disabled (correct)'; ?></code></td></tr>
		</tbody>
	</table>
</div>
