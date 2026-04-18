<?php
/**
 * @package AmidaCompliance
 * @var array $batches
 */
defined( 'ABSPATH' ) || exit;
?>
<div class="wrap amida-compl">
	<h1><?php esc_html_e( 'Batch Log', 'amida-compliance' ); ?></h1>
	<p class="description"><?php esc_html_e( 'Each row links a shipped order to a product batch and its Certificate of Analysis.', 'amida-compliance' ); ?></p>

	<table class="wp-list-table widefat fixed striped">
		<thead>
			<tr>
				<th>ID</th>
				<th><?php esc_html_e( 'Shipped', 'amida-compliance' ); ?></th>
				<th><?php esc_html_e( 'Order', 'amida-compliance' ); ?></th>
				<th><?php esc_html_e( 'Product', 'amida-compliance' ); ?></th>
				<th><?php esc_html_e( 'Batch #', 'amida-compliance' ); ?></th>
				<th>COA</th>
			</tr>
		</thead>
		<tbody>
			<?php foreach ( $batches as $b ) : ?>
				<tr>
					<td><?php echo (int) $b->id; ?></td>
					<td><?php echo esc_html( $b->shipped_at ?: '—' ); ?></td>
					<td><a href="<?php echo esc_url( admin_url( 'post.php?post=' . $b->order_id . '&action=edit' ) ); ?>">#<?php echo (int) $b->order_id; ?></a></td>
					<td><a href="<?php echo esc_url( get_edit_post_link( (int) $b->product_id ) ); ?>"><?php echo esc_html( get_the_title( (int) $b->product_id ) ); ?></a></td>
					<td><code><?php echo esc_html( $b->batch_number ); ?></code></td>
					<td><?php echo $b->coa_file_url ? '<a target="_blank" href="' . esc_url( $b->coa_file_url ) . '">PDF</a>' : '—'; ?></td>
				</tr>
			<?php endforeach; ?>
		</tbody>
	</table>
</div>
