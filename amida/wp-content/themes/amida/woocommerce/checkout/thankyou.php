<?php
/**
 * Thank-you template. Invoked post-checkout.
 *
 * @package Amida
 * @var WC_Order|false $order
 */

defined( 'ABSPATH' ) || exit;
?>

<section class="thankyou container" style="padding:48px 0;max-width:820px">
	<?php if ( $order ) : ?>
		<div class="hero__eyebrow"><?php esc_html_e( 'Order received', 'amida' ); ?></div>
		<h1 style="margin-bottom:6px"><?php esc_html_e( 'Thank you, your order is confirmed.', 'amida' ); ?></h1>
		<p style="color:var(--warm);font-size:1.05rem">
			<?php printf( esc_html__( 'Order #%s — we will notify you when it ships.', 'amida' ), esc_html( $order->get_order_number() ) ); ?>
		</p>

		<?php do_action( 'woocommerce_thankyou', $order->get_id() ); ?>

		<?php get_template_part( 'template-parts/checkout/upsell-funnel' ); ?>

		<div class="pdp-coa-card" style="margin-top:20px">
			<div>
				<div class="pdp-coa-card__title"><?php esc_html_e( 'Batch COAs', 'amida' ); ?></div>
				<div class="pdp-coa-card__meta"><?php esc_html_e( 'COA PDFs are available from your researcher account.', 'amida' ); ?></div>
			</div>
			<a class="btn btn--ghost" href="<?php echo esc_url( home_url( '/account/coa-library' ) ); ?>"><?php esc_html_e( 'View COAs', 'amida' ); ?></a>
		</div>

		<?php if ( defined( 'AMIDA_TELEGRAM_URL' ) && AMIDA_TELEGRAM_URL ) : ?>
			<p style="margin-top:24px">
				<a class="btn btn--amber" href="<?php echo esc_url( AMIDA_TELEGRAM_URL ); ?>" rel="noopener" target="_blank">
					<?php esc_html_e( 'Join the Amida researcher channel on Telegram', 'amida' ); ?>
				</a>
			</p>
		<?php endif; ?>
	<?php else : ?>
		<h1><?php esc_html_e( 'Order received', 'amida' ); ?></h1>
	<?php endif; ?>
</section>
