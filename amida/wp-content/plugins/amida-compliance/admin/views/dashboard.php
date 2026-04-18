<?php
/**
 * Compliance dashboard — last 30-day event breakdown + quick links.
 *
 * @package AmidaCompliance
 * @var array $counts
 */
defined( 'ABSPATH' ) || exit;
?>
<div class="wrap amida-compl">
	<h1><?php esc_html_e( 'Amida Compliance Dashboard', 'amida-compliance' ); ?></h1>
	<p class="description"><?php esc_html_e( 'Events logged over the last 30 days. Export CSVs from the Exports tab for processor audits.', 'amida-compliance' ); ?></p>

	<div class="amida-compl__cards" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin:24px 0">
		<?php if ( empty( $counts ) ) : ?>
			<div class="amida-compl__card"><?php esc_html_e( 'No events logged yet.', 'amida-compliance' ); ?></div>
		<?php else : foreach ( $counts as $c ) : ?>
			<div class="amida-compl__card">
				<div class="amida-compl__metric"><?php echo number_format_i18n( (int) $c->n ); ?></div>
				<div class="amida-compl__label"><?php echo esc_html( $c->event_type ); ?></div>
			</div>
		<?php endforeach; endif; ?>
	</div>

	<h2><?php esc_html_e( 'Quick actions', 'amida-compliance' ); ?></h2>
	<p>
		<a href="<?php echo esc_url( admin_url( 'admin.php?page=amida-compliance-log' ) ); ?>" class="button button-primary"><?php esc_html_e( 'View compliance log', 'amida-compliance' ); ?></a>
		<a href="<?php echo esc_url( admin_url( 'admin.php?page=amida-compliance-exports' ) ); ?>" class="button"><?php esc_html_e( 'Export CSV', 'amida-compliance' ); ?></a>
		<a href="<?php echo esc_url( admin_url( 'admin.php?page=amida-compliance-ny' ) ); ?>" class="button"><?php esc_html_e( 'NY enhanced queue', 'amida-compliance' ); ?></a>
	</p>
</div>
