<?php
/**
 * @package AmidaCompliance
 * @var array $events
 */
defined( 'ABSPATH' ) || exit;
?>
<div class="wrap amida-compl">
	<h1><?php esc_html_e( 'NY Enhanced Flow Queue', 'amida-compliance' ); ?></h1>
	<p class="description"><?php esc_html_e( 'Events originating from New York visitors or NY-resident researchers. Review any flagged items manually.', 'amida-compliance' ); ?></p>
	<table class="wp-list-table widefat fixed striped">
		<thead>
			<tr><th>ID</th><th><?php esc_html_e( 'Date', 'amida-compliance' ); ?></th><th><?php esc_html_e( 'Event', 'amida-compliance' ); ?></th><th>User</th><th><?php esc_html_e( 'Data', 'amida-compliance' ); ?></th></tr>
		</thead>
		<tbody>
			<?php foreach ( $events as $e ) : ?>
				<tr>
					<td><?php echo (int) $e->id; ?></td>
					<td><?php echo esc_html( $e->created_at ); ?></td>
					<td><code><?php echo esc_html( $e->event_type ); ?></code></td>
					<td><?php echo $e->user_id ? esc_html( get_user_by( 'id', $e->user_id )->user_email ?? $e->user_id ) : '—'; ?></td>
					<td><code style="font-size:11px"><?php echo esc_html( $e->event_data ? substr( $e->event_data, 0, 180 ) : '' ); ?></code></td>
				</tr>
			<?php endforeach; ?>
		</tbody>
	</table>
</div>
