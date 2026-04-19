<?php
/**
 * Template Name: Amida — Catalog (Gated)
 *
 * Figma node: 27:3 — Research Catalog page.
 * Requires authenticated researcher; login gate enforced by compliance plugin.
 *
 * @package Amida
 */

if ( ! is_user_logged_in() ) {
	wp_safe_redirect( add_query_arg( 'redirect', rawurlencode( home_url( '/catalog' ) ), home_url( '/login' ) ) );
	exit;
}

get_header();

// Current filter from query string. Allowed values match category slug groups.
$active_filter = isset( $_GET['cat'] ) ? sanitize_key( wp_unslash( $_GET['cat'] ) ) : 'all';
$allowed_filters = [ 'all', 'peptides', 'glp', 'blends' ];
if ( ! in_array( $active_filter, $allowed_filters, true ) ) {
	$active_filter = 'all';
}

// Map filter → WC tax_query.
$tax_query = [];
switch ( $active_filter ) {
	case 'glp':
		$tax_query = [ [ 'taxonomy' => 'product_cat', 'field' => 'slug', 'terms' => [ 'glp-family' ] ] ];
		break;
	case 'blends':
		$tax_query = [ [ 'taxonomy' => 'product_cat', 'field' => 'slug', 'terms' => [ 'blend', 'blends' ] ] ];
		break;
	case 'peptides':
		$tax_query = [ [ 'taxonomy' => 'product_cat', 'field' => 'slug', 'terms' => [ 'glp-family', 'blend', 'blends' ], 'operator' => 'NOT IN' ] ];
		break;
	case 'all':
	default:
		$tax_query = [];
		break;
}

// Sort.
$sort = isset( $_GET['sort'] ) ? sanitize_key( wp_unslash( $_GET['sort'] ) ) : 'featured';
$orderby_map = [
	'featured'   => [ 'orderby' => 'menu_order title', 'order' => 'ASC' ],
	'name'       => [ 'orderby' => 'title',             'order' => 'ASC' ],
	'price-asc'  => [ 'orderby' => 'meta_value_num',    'order' => 'ASC',  'meta_key' => '_price' ],
	'price-desc' => [ 'orderby' => 'meta_value_num',    'order' => 'DESC', 'meta_key' => '_price' ],
];
$sort_args = $orderby_map[ $sort ] ?? $orderby_map['featured'];

// Pagination.
$per_page = 12;
$paged    = max( 1, (int) get_query_var( 'paged', 1 ) );

$query_args = array_merge( [
	'post_type'      => 'product',
	'posts_per_page' => $per_page,
	'paged'          => $paged,
	'tax_query'      => $tax_query,
], $sort_args );

$query = new WP_Query( $query_args );

// Counts for filter chip labels.
$count_all      = (int) wp_count_posts( 'product' )->publish;
$count_glp      = (int) ( get_term_by( 'slug', 'glp-family', 'product_cat' )->count ?? 0 );
$count_blends   = (int) ( get_term_by( 'slug', 'blend', 'product_cat' )->count ?? get_term_by( 'slug', 'blends', 'product_cat' )->count ?? 0 );
$count_peptides = max( 0, $count_all - $count_glp - $count_blends );

$total_found = (int) $query->found_posts;
$start_idx   = $total_found ? ( ( $paged - 1 ) * $per_page + 1 ) : 0;
$end_idx     = min( $paged * $per_page, $total_found );

$filter_url = static function ( string $slug ) use ( $sort ): string {
	$args = [ 'cat' => $slug ];
	if ( 'featured' !== $sort ) {
		$args['sort'] = $sort;
	}
	return esc_url( add_query_arg( $args, home_url( '/catalog' ) ) );
};
?>

<section class="amida-catalog">

	<header class="amida-catalog__hero">
		<div class="amida-catalog__crumbs">
			<a href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'HOME', 'amida' ); ?></a>
			<span aria-hidden="true">/</span>
			<span><?php esc_html_e( 'CATALOG', 'amida' ); ?></span>
		</div>
		<h1 class="amida-catalog__title"><?php esc_html_e( 'Research Catalog', 'amida' ); ?></h1>
		<p class="amida-catalog__subtitle">
			<?php esc_html_e( 'HPLC-verified research compounds. Each unit ships with a batch-specific Certificate of Analysis. For research use only — not for human or animal consumption.', 'amida' ); ?>
		</p>
	</header>

	<nav class="amida-catalog__filters" aria-label="<?php esc_attr_e( 'Category filter', 'amida' ); ?>">
		<div class="amida-catalog__filters-inner">
			<a class="filter-chip <?php echo 'all' === $active_filter ? 'is-active' : ''; ?>" href="<?php echo $filter_url( 'all' ); ?>">
				<?php esc_html_e( 'All', 'amida' ); ?> (<?php echo esc_html( (string) $count_all ); ?>)
			</a>
			<a class="filter-chip <?php echo 'peptides' === $active_filter ? 'is-active' : ''; ?>" href="<?php echo $filter_url( 'peptides' ); ?>">
				<?php esc_html_e( 'Peptides', 'amida' ); ?> (<?php echo esc_html( (string) $count_peptides ); ?>)
			</a>
			<a class="filter-chip <?php echo 'glp' === $active_filter ? 'is-active' : ''; ?>" href="<?php echo $filter_url( 'glp' ); ?>">
				<?php esc_html_e( 'GLP Series', 'amida' ); ?> (<?php echo esc_html( (string) $count_glp ); ?>)
			</a>
			<a class="filter-chip <?php echo 'blends' === $active_filter ? 'is-active' : ''; ?>" href="<?php echo $filter_url( 'blends' ); ?>">
				<?php esc_html_e( 'Blends', 'amida' ); ?> (<?php echo esc_html( (string) $count_blends ); ?>)
			</a>
		</div>
	</nav>

	<div class="amida-catalog__sortbar">
		<div class="amida-catalog__sortbar-inner">
			<span class="amida-catalog__result-count">
				<?php
				printf(
					/* translators: 1: start index, 2: end index, 3: total */
					esc_html__( 'SHOWING %1$d–%2$d OF %3$d COMPOUNDS', 'amida' ),
					$start_idx,
					$end_idx,
					$total_found
				);
				?>
			</span>
			<form method="get" class="amida-catalog__sort" role="search">
				<?php if ( 'all' !== $active_filter ) : ?>
					<input type="hidden" name="cat" value="<?php echo esc_attr( $active_filter ); ?>">
				<?php endif; ?>
				<label for="amida-sort"><?php esc_html_e( 'Sort:', 'amida' ); ?></label>
				<select id="amida-sort" name="sort" onchange="this.form.submit()">
					<option value="featured"   <?php selected( $sort, 'featured' ); ?>><?php esc_html_e( 'Featured', 'amida' ); ?></option>
					<option value="name"       <?php selected( $sort, 'name' ); ?>><?php esc_html_e( 'Name', 'amida' ); ?></option>
					<option value="price-asc"  <?php selected( $sort, 'price-asc' ); ?>><?php esc_html_e( 'Price: low to high', 'amida' ); ?></option>
					<option value="price-desc" <?php selected( $sort, 'price-desc' ); ?>><?php esc_html_e( 'Price: high to low', 'amida' ); ?></option>
				</select>
			</form>
		</div>
	</div>

	<div class="amida-catalog__grid">
		<?php if ( $query->have_posts() ) : ?>
			<?php while ( $query->have_posts() ) : $query->the_post();
				$product = wc_get_product( get_the_ID() );
				if ( ! $product ) { continue; }

				$cats        = wp_get_post_terms( get_the_ID(), 'product_cat' );
				$cat_name    = ( $cats && ! is_wp_error( $cats ) && isset( $cats[0] ) ) ? $cats[0]->name : '';
				$cat_slug    = ( $cats && ! is_wp_error( $cats ) && isset( $cats[0] ) ) ? $cats[0]->slug : 'peptides';
				$purity      = get_post_meta( get_the_ID(), '_amida_purity', true );
				$has_coa     = (bool) get_post_meta( get_the_ID(), '_amida_coa_url', true );
				$tint_slug   = sanitize_html_class( $cat_slug );
				?>
				<a class="amida-product-card" data-tint="<?php echo esc_attr( $tint_slug ); ?>" href="<?php the_permalink(); ?>">
					<div class="amida-product-card__image">
						<span class="amida-product-card__chip"><?php echo esc_html( strtoupper( $cat_name ) ); ?></span>
						<?php if ( $has_coa ) : ?>
							<span class="amida-product-card__coa-chip"><?php esc_html_e( 'COA', 'amida' ); ?></span>
						<?php endif; ?>
						<div class="amida-vial" aria-hidden="true">
							<span class="amida-vial__cap"></span>
							<span class="amida-vial__body"></span>
						</div>
					</div>
					<div class="amida-product-card__meta">
						<div class="amida-product-card__sku"><?php the_title(); ?></div>
						<div class="amida-product-card__info">
							<div>
								<div class="hplc-label"><?php esc_html_e( 'HPLC PURITY', 'amida' ); ?></div>
								<div class="hplc-value"><?php echo esc_html( $purity ?: '—' ); ?></div>
							</div>
							<div class="amida-product-card__price"><?php echo wp_kses_post( $product->get_price_html() ); ?></div>
						</div>
					</div>
				</a>
			<?php endwhile; wp_reset_postdata(); ?>
		<?php else : ?>
			<p class="amida-catalog__empty"><?php esc_html_e( 'No compounds match the current filter. Try a different category.', 'amida' ); ?></p>
		<?php endif; ?>
	</div>

	<?php
	$big = 999999999;
	$links = paginate_links( [
		'base'      => str_replace( $big, '%#%', esc_url( get_pagenum_link( $big ) ) ),
		'format'    => '?paged=%#%',
		'current'   => $paged,
		'total'     => $query->max_num_pages,
		'prev_text' => '&larr;',
		'next_text' => '&rarr;',
		'type'      => 'array',
		'end_size'  => 1,
		'mid_size'  => 2,
	] );
	if ( $links ) : ?>
		<nav class="amida-catalog__pagination" aria-label="<?php esc_attr_e( 'Catalog pagination', 'amida' ); ?>">
			<?php foreach ( $links as $link ) : ?>
				<?php echo wp_kses_post( $link ); ?>
			<?php endforeach; ?>
		</nav>
	<?php endif; ?>

</section>

<?php get_footer();
