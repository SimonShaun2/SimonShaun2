<?php
/**
 * Template Name: Amida — Catalog (Gated)
 *
 * Requires authenticated researcher. The compliance plugin enforces the
 * login gate — this template only renders the UI.
 *
 * @package Amida
 */

if ( ! is_user_logged_in() ) {
	wp_safe_redirect( add_query_arg( 'redirect', rawurlencode( home_url( '/catalog' ) ), home_url( '/login' ) ) );
	exit;
}

get_header();

$categories = get_terms( [
	'taxonomy'   => 'product_cat',
	'hide_empty' => true,
] );

$query = new WP_Query( [
	'post_type'      => 'product',
	'posts_per_page' => 60,
	'orderby'        => 'menu_order title',
	'order'          => 'ASC',
] );
?>

<section class="container" style="padding: 48px 0">
	<header style="margin-bottom: 36px">
		<div class="hero__eyebrow"><?php esc_html_e( 'Research Catalog', 'amida' ); ?></div>
		<h1 style="margin-bottom: 8px"><?php printf( esc_html__( 'Welcome, %s.', 'amida' ), esc_html( amida_user_name() ) ); ?></h1>
		<p style="color:var(--warm);font-size:1.05rem;max-width:640px">
			<?php esc_html_e( 'All compounds below are research-grade, HPLC verified, and ship with a batch-specific Certificate of Analysis. Not for human or animal consumption.', 'amida' ); ?>
		</p>
	</header>

	<?php if ( $categories && ! is_wp_error( $categories ) ) : ?>
		<nav class="catalog-filters" style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:28px">
			<a class="btn btn--ghost" href="<?php echo esc_url( home_url( '/catalog' ) ); ?>"><?php esc_html_e( 'All', 'amida' ); ?></a>
			<?php foreach ( $categories as $cat ) : ?>
				<a class="btn btn--ghost" href="<?php echo esc_url( get_term_link( $cat ) ); ?>"><?php echo esc_html( $cat->name ); ?></a>
			<?php endforeach; ?>
		</nav>
	<?php endif; ?>

	<div class="catalog-grid">
		<?php if ( $query->have_posts() ) : ?>
			<?php while ( $query->have_posts() ) : $query->the_post();
				$product = wc_get_product( get_the_ID() );
				if ( ! $product ) { continue; }
				$cat      = wp_get_post_terms( get_the_ID(), 'product_cat' );
				$cat_name = $cat && ! is_wp_error( $cat ) ? $cat[0]->name : '';
				$size     = get_post_meta( get_the_ID(), '_amida_size', true );
				$purity   = get_post_meta( get_the_ID(), '_amida_purity', true );
				?>
				<a class="product-card" href="<?php the_permalink(); ?>">
					<div class="product-card__image">
						<?php echo $product->get_image( 'amida-product-card' ); ?>
						<?php if ( $purity ) : ?>
							<span class="product-card__purity"><?php echo esc_html( $purity ); ?></span>
						<?php endif; ?>
					</div>
					<div class="product-card__body">
						<div class="product-card__category"><?php echo esc_html( $cat_name ); ?></div>
						<div class="product-card__title"><?php the_title(); ?></div>
						<div class="product-card__size"><?php echo esc_html( $size ); ?></div>
						<div class="product-card__footer">
							<span class="product-card__price"><?php echo wp_kses_post( $product->get_price_html() ); ?></span>
							<span style="font-size:.82rem;color:var(--warm)"><?php esc_html_e( 'View →', 'amida' ); ?></span>
						</div>
					</div>
				</a>
			<?php endwhile; wp_reset_postdata(); ?>
		<?php else : ?>
			<p><?php esc_html_e( 'No products available yet. Check back soon.', 'amida' ); ?></p>
		<?php endif; ?>
	</div>
</section>

<?php get_footer();
