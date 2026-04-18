<?php
/**
 * Slide-out cart drawer. Rendered on every authenticated page. Populated via
 * WC fragments so counts stay fresh without a reload.
 *
 * @package Amida
 */

defined( 'ABSPATH' ) || exit;

$cart = WC()->cart;
$subtotal = $cart ? (float) $cart->get_subtotal() : 0;
$threshold = defined( 'AMIDA_FREE_SHIPPING_THRESHOLD' ) ? (int) AMIDA_FREE_SHIPPING_THRESHOLD : 250;
$remaining = max( 0, $threshold - $subtotal );
$progress  = $subtotal >= $threshold ? 100 : (int) round( $subtotal / $threshold * 100 );
?>
<div class="cart-drawer-backdrop" data-cart-close></div>
<aside class="cart-drawer" aria-label="<?php esc_attr_e( 'Cart', 'amida' ); ?>" aria-hidden="true" role="dialog">
	<header class="cart-drawer__header">
		<h3 style="margin:0;font-family:var(--font-display);font-size:1.3rem">
			<?php printf( esc_html__( 'Research Supplies (%d)', 'amida' ), $cart ? $cart->get_cart_contents_count() : 0 ); ?>
		</h3>
		<button type="button" class="btn btn--ghost btn--sm" data-cart-close aria-label="<?php esc_attr_e( 'Close cart', 'amida' ); ?>">✕</button>
	</header>

	<div class="free-shipping-bar" style="margin:16px 20px;padding:12px 14px">
		<?php if ( $remaining > 0 ) : ?>
			<?php printf( esc_html__( 'Add %s more for FREE shipping', 'amida' ), esc_html( amida_price( $remaining ) ) ); ?>
		<?php else : ?>
			<?php esc_html_e( 'Free shipping unlocked 🚚', 'amida' ); ?>
		<?php endif; ?>
		<div class="free-shipping-bar__track"><div class="free-shipping-bar__fill" style="width:<?php echo esc_attr( $progress ); ?>%"></div></div>
	</div>

	<div class="cart-drawer__body">
		<?php if ( $cart && ! $cart->is_empty() ) : ?>
			<?php foreach ( $cart->get_cart() as $key => $item ) :
				$product = $item['data'];
				$pack    = $item['amida_pack'] ?? 1;
				$batch   = get_post_meta( $item['product_id'], '_amida_batch', true );
				?>
				<div class="cart-item" style="display:grid;grid-template-columns:56px 1fr auto;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)" data-cart-item="<?php echo esc_attr( $key ); ?>">
					<?php echo $product->get_image( 'thumbnail', [ 'style' => 'width:56px;height:56px;border-radius:8px;object-fit:cover' ] ); ?>
					<div>
						<div style="font-family:var(--font-display);font-size:1.05rem"><?php echo esc_html( $product->get_name() ); ?></div>
						<div style="font-size:.78rem;color:var(--muted)">
							<?php printf( esc_html__( 'Pack: %d · Batch %s', 'amida' ), (int) $pack, esc_html( $batch ?: 'TBD' ) ); ?>
						</div>
					</div>
					<div style="text-align:right">
						<div><?php echo wp_kses_post( wc_price( $item['line_total'] ) ); ?></div>
						<a href="<?php echo esc_url( wc_get_cart_remove_url( $key ) ); ?>" style="font-size:.76rem;color:var(--error)"><?php esc_html_e( 'Remove', 'amida' ); ?></a>
					</div>
				</div>
			<?php endforeach; ?>
		<?php else : ?>
			<p style="color:var(--muted);text-align:center;padding:40px 0"><?php esc_html_e( 'Your cart is empty.', 'amida' ); ?></p>
		<?php endif; ?>

		<section style="margin-top:20px">
			<h4 style="font-family:var(--font-body);font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;color:var(--warm);margin:0 0 10px">
				<?php esc_html_e( 'Research Supplies', 'amida' ); ?>
			</h4>
			<?php foreach ( amida_upsell_accessories() as $a ) : ?>
				<label style="display:flex;align-items:center;gap:12px;padding:10px;border:1px solid var(--border);border-radius:8px;margin-bottom:8px;cursor:pointer">
					<input type="checkbox" data-amida-upsell="<?php echo esc_attr( $a['slug'] ); ?>">
					<span style="flex:1">
						<strong><?php echo esc_html( $a['label'] ); ?></strong><br>
						<span style="font-size:.82rem;color:var(--muted)"><?php echo esc_html( amida_price( $a['price'] ) ); ?></span>
					</span>
				</label>
			<?php endforeach; ?>
		</section>
	</div>

	<footer class="cart-drawer__footer">
		<div style="display:flex;justify-content:space-between;margin-bottom:10px">
			<span style="color:var(--muted);font-size:.85rem"><?php esc_html_e( 'Subtotal', 'amida' ); ?></span>
			<strong><?php echo $cart ? wp_kses_post( wc_price( $subtotal ) ) : '$0'; ?></strong>
		</div>
		<a class="btn btn--block" href="<?php echo esc_url( wc_get_checkout_url() ); ?>">
			<?php esc_html_e( 'Checkout', 'amida' ); ?>
			<?php if ( $cart ) : ?> <?php echo wp_kses_post( wc_price( $subtotal ) ); ?><?php endif; ?> →
		</a>
	</footer>
</aside>
<?php
if ( ! function_exists( 'amida_upsell_accessories' ) ) {
	/**
	 * Config for cart upsell toggles. Matches the SKUs seeded by A3.
	 */
	function amida_upsell_accessories(): array {
		return [
			[ 'slug' => 'BACWATER-30',  'label' => 'Bacteriostatic Water 30ml',     'price' => 17 ],
			[ 'slug' => 'SYRINGES-100', 'label' => 'Insulin Syringes 29g x 100',    'price' => 24.99 ],
			[ 'slug' => 'SWABS-200',    'label' => 'Alcohol Swabs x 200',           'price' => 8.99 ],
			[ 'slug' => 'VIALS-5',      'label' => 'Mixing Vials x 5',              'price' => 12 ],
		];
	}
}
