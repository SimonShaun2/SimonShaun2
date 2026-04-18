<?php
/**
 * @package AmidaCompliance
 * @var array $events
 */
defined( 'ABSPATH' ) || exit;
?>
<div class="wrap amida-compl">
	<h1><?php esc_html_e( 'Compliance Log', 'amida-compliance' ); ?></h1>

	<form method="get" style="margin:16px 0">
		<input type="hidden" name="page" value="amida-compliance-log">
		<select name="event">
			<option value=""><?php esc_html_e( 'All events', 'amida-compliance' ); ?></option>
			<?php foreach ( AMIDA_EVENT_TYPES as $e ) : ?>
				<option value="<?php echo esc_attr( $e ); ?>" <?php selected( $_GET['event'] ?? '', $e ); ?>><?php echo esc_html( $e ); ?></option>
			<?php endforeach; ?>
		</select>
		<input type="text" name="state" placeholder="<?php esc_attr_e( 'State (e.g. NY)', 'amida-compliance' ); ?>" value="<?php echo esc_attr( $_GET['state'] ?? '' ); ?>" maxlength="2" style="width:90px">
		<button class="button"><?php esc_html_e( 'Filter', 'amida-compliance' ); ?></button>
	</form>

	<table class="wp-list-table widefat fixed striped">
		<thead>
			<tr>
				<th><?php esc_html_e( 'ID', 'amida-compliance' ); ?></th>
				<th><?php esc_html_e( 'Date', 'amida-compliance' ); ?></th>
				<th><?php esc_html_e( 'Event', 'amida-compliance' ); ?></th>
				<th><?php esc_html_e( 'User', 'amida-compliance' ); ?></th>
				<th><?php esc_html_e( 'State', 'amida-compliance' ); ?></th>
				<th><?php esc_html_e( 'Data', 'amida-compliance' ); ?></th>
			</tr>
		</thead>
		<tbody>
			<?php foreach ( $events as $e ) : ?>
				<tr>
					<td><?php echo (int) $e->id; ?></td>
					<td><?php echo esc_html( $e->created_at ); ?></td>
					<td><code><?php echo esc_html( $e->event_type ); ?></code></td>
					<td><?php echo $e->user_id ? esc_html( get_user_by( 'id', $e->user_id )->user_email ?? $e->user_id ) : '—'; ?></td>
					<td><?php echo esc_html( $e->state_code ?: '—' ); ?></td>
					<td><code style="font-size:11px"><?php echo esc_html( $e->event_data ? substr( $e->event_data, 0, 160 ) : '' ); ?></code></td>
				</tr>
			<?php endforeach; ?>
		</tbody>
	</table>
</div>
