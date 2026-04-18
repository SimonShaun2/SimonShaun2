<?php
/**
 * Single product PDP. Protected by login gate (enforced by plugin).
 *
 * @package Amida
 */

defined( 'ABSPATH' ) || exit;

if ( ! is_user_logged_in() ) {
	wp_safe_redirect( add_query_arg( 'redirect', rawurlencode( get_permalink() ), home_url( '/login' ) ) );
	exit;
}

get_header( 'shop' );
?>

<div class="container" style="padding: 48px 0">
	<?php while ( have_posts() ) : the_post();
		global $product;
		$real_name = get_post_meta( $product->get_id(), '_amida_real_compound', true );
		$cas       = get_post_meta( $product->get_id(), '_amida_cas', true );
		$formula   = get_post_meta( $product->get_id(), '_amida_formula', true );
		$purity    = get_post_meta( $product->get_id(), '_amida_purity', true );
		$size      = get_post_meta( $product->get_id(), '_amida_size', true );
		$batch     = get_post_meta( $product->get_id(), '_amida_batch', true );
		?>
		<div class="pdp-hero">
			<div class="pdp-hero__media">
				<?php echo $product->get_image( 'amida-product-hero' ); ?>
				<?php if ( $purity ) : ?>
					<div class="pdp-hero__purity-overlay"><?php echo esc_html( $purity ); ?></div>
				<?php endif; ?>
				<?php if ( $batch ) : ?>
					<div class="pdp-hero__batch"><?php printf( esc_html__( 'Batch %s', 'amida' ), esc_html( $batch ) ); ?></div>
				<?php endif; ?>
			</div>

			<div class="pdp-hero__info summary entry-summary">
				<?php
				// Hooks from inc/woocommerce.php inject: RUO chip (8), compound image (15),
				// size selector (20), COA card (22), RUO notice (26).
				do_action( 'woocommerce_single_product_summary' );
				?>

				<div class="pdp-specs" style="margin-top: 28px">
					<?php if ( $cas ) : ?>
						<div class="pdp-specs__row">
							<div class="pdp-specs__label"><?php esc_html_e( 'CAS', 'amida' ); ?></div>
							<div class="pdp-specs__value"><?php echo esc_html( $cas ); ?></div>
						</div>
					<?php endif; ?>
					<?php if ( $formula ) : ?>
						<div class="pdp-specs__row">
							<div class="pdp-specs__label"><?php esc_html_e( 'Molecular Formula', 'amida' ); ?></div>
							<div class="pdp-specs__value"><?php echo esc_html( $formula ); ?></div>
						</div>
					<?php endif; ?>
					<?php if ( $size ) : ?>
						<div class="pdp-specs__row">
							<div class="pdp-specs__label"><?php esc_html_e( 'Size', 'amida' ); ?></div>
							<div class="pdp-specs__value"><?php echo esc_html( $size ); ?></div>
						</div>
					<?php endif; ?>
					<div class="pdp-specs__row">
						<div class="pdp-specs__label"><?php esc_html_e( 'Appearance', 'amida' ); ?></div>
						<div class="pdp-specs__value"><?php esc_html_e( 'Lyophilized white powder', 'amida' ); ?></div>
					</div>
					<div class="pdp-specs__row">
						<div class="pdp-specs__label"><?php esc_html_e( 'Testing', 'amida' ); ?></div>
						<div class="pdp-specs__value"><?php esc_html_e( 'HPLC + Mass Spec, third-party', 'amida' ); ?></div>
					</div>
				</div>
			</div>
		</div>

		<section style="padding: 48px 0">
			<h3 style="margin-bottom:16px"><?php esc_html_e( 'Description', 'amida' ); ?></h3>
			<div style="max-width:760px;font-size:1rem;line-height:1.7"><?php the_content(); ?></div>
		</section>

		<section style="padding: 24px 0">
			<h3 style="margin-bottom:16px"><?php esc_html_e( 'Related Research Compounds', 'amida' ); ?></h3>
			<?php woocommerce_related_products( [ 'posts_per_page' => 4, 'columns' => 4 ] ); ?>
		</section>
	<?php endwhile; ?>
</div>

<?php
get_footer( 'shop' );
