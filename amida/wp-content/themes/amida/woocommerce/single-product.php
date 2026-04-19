<?php
/**
 * Single product PDP (Figma node 28:3).
 *
 * Login-gated catalog page. The compliance plugin enforces auth — this
 * template only renders the UI and delegates ATC + variation logic to
 * WooCommerce defaults via filters in inc/woocommerce.php.
 *
 * @package Amida
 */

defined( 'ABSPATH' ) || exit;

if ( ! is_user_logged_in() ) {
	wp_safe_redirect( add_query_arg( 'redirect', rawurlencode( get_permalink() ), home_url( '/login' ) ) );
	exit;
}

get_header( 'shop' );

while ( have_posts() ) :
	the_post();
	global $product;
	if ( ! $product ) {
		continue;
	}

	$pid = $product->get_id();

	// Figma-driven meta fields. All are optional; fallbacks supplied below.
	$purity      = get_post_meta( $pid, '_amida_purity', true );
	$batch       = get_post_meta( $pid, '_amida_batch', true );
	$coa_url     = get_post_meta( $pid, '_amida_coa_url', true );
	$test_date   = get_post_meta( $pid, '_amida_test_date', true );
	$subtitle    = get_post_meta( $pid, '_amida_subtitle', true );
	$mw          = get_post_meta( $pid, '_amida_mw', true );
	$cas         = get_post_meta( $pid, '_amida_cas', true );
	$formula     = get_post_meta( $pid, '_amida_formula', true );
	$sequence    = get_post_meta( $pid, '_amida_sequence', true );
	$storage     = get_post_meta( $pid, '_amida_storage_temp', true );
	$shelf_life  = get_post_meta( $pid, '_amida_shelf_life', true );
	$appearance  = get_post_meta( $pid, '_amida_appearance', true );
	$solubility  = get_post_meta( $pid, '_amida_solubility', true );
	$bestseller  = (bool) get_post_meta( $pid, '_amida_bestseller', true );
	$compound_id = get_post_meta( $pid, '_amida_real_compound', true );
	$compound_img = get_post_meta( $pid, '_amida_compound_image_url', true );

	$mg_raw = get_post_meta( $pid, '_amida_mg_options', true );
	$mg_options = array_values( array_filter( array_map( 'trim', explode( ',', (string) $mg_raw ) ) ) );
	if ( empty( $mg_options ) ) {
		$mg_options = [ '2mg', '5mg', '10mg', '15mg' ];
	}

	$single_price = (float) $product->get_price();
	$pack3_price  = (float) get_post_meta( $pid, '_amida_pack_3', true );
	$pack5_price  = (float) get_post_meta( $pid, '_amida_pack_5', true );
	$pack10_price = (float) get_post_meta( $pid, '_amida_pack_10', true );

	$cats     = wp_get_post_terms( $pid, 'product_cat' );
	$cat_name = ( $cats && ! is_wp_error( $cats ) && isset( $cats[0] ) ) ? $cats[0]->name : '';
	$cat_slug = ( $cats && ! is_wp_error( $cats ) && isset( $cats[0] ) ) ? $cats[0]->slug : 'peptides';

	$attachment_ids = $product->get_gallery_image_ids();
	$main_image     = $product->get_image_id() ? wp_get_attachment_image_url( $product->get_image_id(), 'full' ) : '';
	?>

<article class="amida-pdp" data-product="<?php echo esc_attr( (string) $pid ); ?>">

	<div class="amida-pdp__hero">

		<div class="amida-pdp__gallery" data-tint="<?php echo esc_attr( sanitize_html_class( $cat_slug ) ); ?>">
			<div class="amida-pdp__gallery-main">
				<?php if ( $main_image ) : ?>
					<img src="<?php echo esc_url( $main_image ); ?>" alt="<?php echo esc_attr( get_the_title() ); ?>" class="amida-pdp__main-image">
				<?php else : ?>
					<div class="amida-vial amida-vial--lg" aria-hidden="true">
						<span class="amida-vial__cap"></span>
						<span class="amida-vial__body"></span>
					</div>
				<?php endif; ?>
				<button type="button" class="amida-pdp__zoom" aria-label="<?php esc_attr_e( 'Zoom image', 'amida' ); ?>">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M11 8v6"/><path d="M8 11h6"/></svg>
				</button>
			</div>

			<div class="amida-pdp__thumbs">
				<button type="button" class="amida-pdp__thumb is-active" data-index="0" aria-label="<?php esc_attr_e( 'Main view', 'amida' ); ?>">
					<div class="amida-vial amida-vial--sm" aria-hidden="true"><span class="amida-vial__cap"></span><span class="amida-vial__body"></span></div>
				</button>
				<?php
				$thumb_idx = 1;
				foreach ( $attachment_ids as $attachment_id ) :
					if ( $thumb_idx > 3 ) { break; }
					$thumb_url = wp_get_attachment_image_url( $attachment_id, 'medium' );
					if ( ! $thumb_url ) { continue; }
					?>
					<button type="button" class="amida-pdp__thumb" data-index="<?php echo esc_attr( (string) $thumb_idx ); ?>">
						<img src="<?php echo esc_url( $thumb_url ); ?>" alt="">
					</button>
					<?php
					$thumb_idx++;
				endforeach;
				while ( $thumb_idx <= 3 ) :
					?>
					<button type="button" class="amida-pdp__thumb amida-pdp__thumb--ghost" data-index="<?php echo esc_attr( (string) $thumb_idx ); ?>" aria-hidden="true"></button>
					<?php
					$thumb_idx++;
				endwhile;
				?>
			</div>
		</div>

		<div class="amida-pdp__info">

			<div class="amida-pdp__chips">
				<?php if ( $cat_name ) : ?>
					<span class="amida-chip amida-chip--category"><?php echo esc_html( strtoupper( $cat_name ) ); ?></span>
				<?php endif; ?>
				<?php if ( $bestseller ) : ?>
					<span class="amida-chip amida-chip--bestseller">&#9733; <?php esc_html_e( 'BESTSELLER', 'amida' ); ?></span>
				<?php endif; ?>
			</div>

			<h1 class="amida-pdp__title"><?php the_title(); ?></h1>

			<?php if ( $subtitle ) : ?>
				<p class="amida-pdp__subtitle"><?php echo esc_html( $subtitle ); ?></p>
			<?php else : ?>
				<p class="amida-pdp__subtitle"><?php esc_html_e( 'Lyophilized · USA Lab-Sourced · Research Grade', 'amida' ); ?></p>
			<?php endif; ?>

			<?php if ( $compound_id || $compound_img ) : ?>
				<div class="amida-pdp__compound-box">
					<div class="amida-pdp__compound-label">
						<span class="amida-pdp__compound-icon" aria-hidden="true">&#x2B22;</span>
						<?php esc_html_e( 'COMPOUND IDENTIFICATION', 'amida' ); ?>
					</div>
					<div class="amida-pdp__compound-note">
						<?php if ( $compound_img ) : ?>
							<img src="<?php echo esc_url( $compound_img ); ?>" alt="<?php esc_attr_e( 'Compound reference', 'amida' ); ?>" class="amida-pdp__compound-image">
						<?php else : ?>
							<?php esc_html_e( 'Full compound data provided with shipment and COA.', 'amida' ); ?>
						<?php endif; ?>
					</div>
				</div>
			<?php endif; ?>

			<div class="amida-pdp__price-block">
				<div class="amida-pdp__price-label"><?php esc_html_e( 'STARTING AT', 'amida' ); ?></div>
				<div class="amida-pdp__price"><?php echo wp_kses_post( wc_price( $single_price ) ); ?></div>
			</div>

			<?php if ( $purity ) : ?>
				<div class="amida-pdp__purity-box">
					<div>
						<div class="amida-pdp__purity-label"><?php esc_html_e( 'HPLC PURITY', 'amida' ); ?></div>
						<div class="amida-pdp__purity-value"><?php echo esc_html( $purity ); ?></div>
					</div>
					<div class="amida-pdp__purity-meta">
						<?php if ( $batch ) : ?>
							<div><?php echo esc_html( sprintf( __( 'BATCH %s', 'amida' ), $batch ) ); ?></div>
						<?php endif; ?>
						<?php if ( $test_date ) : ?>
							<div><?php echo esc_html( $test_date ); ?></div>
						<?php endif; ?>
					</div>
				</div>
			<?php endif; ?>

			<form class="cart amida-pdp__form" method="post" enctype="multipart/form-data">

				<fieldset class="amida-pdp__option-group">
					<legend class="amida-pdp__option-label"><?php esc_html_e( 'MILLIGRAM', 'amida' ); ?></legend>
					<div class="amida-pdp__mg-pills" role="radiogroup">
						<?php foreach ( $mg_options as $i => $mg ) : ?>
							<label class="amida-pill amida-pill--mg <?php echo 0 === $i ? 'is-active' : ''; ?>">
								<input type="radio" name="amida_mg" value="<?php echo esc_attr( $mg ); ?>" <?php checked( 0, $i ); ?>>
								<span><?php echo esc_html( $mg ); ?></span>
							</label>
						<?php endforeach; ?>
					</div>
				</fieldset>

				<fieldset class="amida-pdp__option-group">
					<legend class="amida-pdp__option-label"><?php esc_html_e( 'PACK SIZE', 'amida' ); ?></legend>
					<div class="amida-pdp__pack-pills" role="radiogroup">
						<label class="amida-pill amida-pill--pack is-active">
							<input type="radio" name="amida_pack" value="1" checked>
							<span class="amida-pill__primary"><?php esc_html_e( 'Single Vial', 'amida' ); ?></span>
							<span class="amida-pill__secondary"><?php echo wp_kses_post( wc_price( $single_price ) ); ?></span>
						</label>
						<?php if ( $pack3_price ) : ?>
							<label class="amida-pill amida-pill--pack">
								<input type="radio" name="amida_pack" value="3">
								<span class="amida-pill__primary"><?php esc_html_e( '3-Pack', 'amida' ); ?></span>
								<span class="amida-pill__secondary"><?php echo wp_kses_post( wc_price( $pack3_price ) ); ?></span>
								<span class="amida-pill__badge"><?php esc_html_e( 'Save 15%', 'amida' ); ?></span>
							</label>
						<?php endif; ?>
						<?php if ( $pack5_price ) : ?>
							<label class="amida-pill amida-pill--pack">
								<input type="radio" name="amida_pack" value="5">
								<span class="amida-pill__primary"><?php esc_html_e( '5-Pack', 'amida' ); ?></span>
								<span class="amida-pill__secondary"><?php echo wp_kses_post( wc_price( $pack5_price ) ); ?></span>
								<span class="amida-pill__badge"><?php esc_html_e( 'Save 20%', 'amida' ); ?></span>
							</label>
						<?php endif; ?>
						<?php if ( $pack10_price ) : ?>
							<label class="amida-pill amida-pill--pack">
								<input type="radio" name="amida_pack" value="10">
								<span class="amida-pill__primary"><?php esc_html_e( '10-Pack', 'amida' ); ?></span>
								<span class="amida-pill__secondary"><?php echo wp_kses_post( wc_price( $pack10_price ) ); ?></span>
								<span class="amida-pill__badge"><?php esc_html_e( 'Save 28%', 'amida' ); ?></span>
							</label>
						<?php endif; ?>
					</div>
				</fieldset>

				<?php if ( $coa_url ) : ?>
					<div class="amida-pdp__coa-card">
						<div class="amida-pdp__coa-icon" aria-hidden="true">
							<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 15l2 2 4-4"/></svg>
						</div>
						<div class="amida-pdp__coa-meta">
							<div class="amida-pdp__coa-title"><?php esc_html_e( 'Certificate of Analysis', 'amida' ); ?></div>
							<div class="amida-pdp__coa-sub">
								<?php echo esc_html( sprintf( __( 'Batch %1$s · Tested %2$s', 'amida' ), $batch ?: '—', $test_date ?: '—' ) ); ?>
							</div>
						</div>
						<a href="<?php echo esc_url( $coa_url ); ?>" class="amida-pdp__coa-btn" target="_blank" rel="noopener">
							&darr; <?php esc_html_e( 'PDF', 'amida' ); ?>
						</a>
					</div>
				<?php endif; ?>

				<div class="amida-pdp__atc-row">
					<div class="amida-pdp__qty">
						<button type="button" class="amida-pdp__qty-btn" data-step="-1" aria-label="<?php esc_attr_e( 'Decrease quantity', 'amida' ); ?>">&minus;</button>
						<input type="number" class="amida-pdp__qty-input" name="quantity" value="1" min="1" max="99" inputmode="numeric">
						<button type="button" class="amida-pdp__qty-btn" data-step="1" aria-label="<?php esc_attr_e( 'Increase quantity', 'amida' ); ?>">+</button>
					</div>
					<button type="submit" class="amida-pdp__atc" name="add-to-cart" value="<?php echo esc_attr( (string) $pid ); ?>">
						<span class="amida-pdp__atc-label"><?php esc_html_e( 'ADD TO CART', 'amida' ); ?></span>
						<span class="amida-pdp__atc-dot" aria-hidden="true">·</span>
						<span class="amida-pdp__atc-price"><?php echo wp_kses_post( wc_price( $single_price ) ); ?></span>
						<span class="amida-pdp__atc-arrow" aria-hidden="true">&rarr;</span>
					</button>
				</div>
			</form>
		</div>
	</div>

	<section class="amida-pdp__specs">
		<div class="amida-pdp__specs-inner">
			<div class="amida-pdp__eyebrow"><?php esc_html_e( 'TECHNICAL DATA', 'amida' ); ?></div>
			<h2 class="amida-pdp__section-title"><?php esc_html_e( 'Compound Specifications', 'amida' ); ?></h2>

			<div class="amida-pdp__specs-grid">
				<div class="amida-pdp__spec-card">
					<div class="amida-pdp__spec-eyebrow"><?php esc_html_e( 'MOLECULAR PROPERTIES', 'amida' ); ?></div>
					<div class="amida-pdp__spec-rows">
						<?php if ( $mw ) : ?>
							<div class="amida-pdp__spec-row"><span class="amida-pdp__spec-label"><?php esc_html_e( 'Molecular Weight', 'amida' ); ?></span><span class="amida-pdp__spec-value"><?php echo esc_html( $mw ); ?></span></div>
						<?php endif; ?>
						<?php if ( $formula ) : ?>
							<div class="amida-pdp__spec-row"><span class="amida-pdp__spec-label"><?php esc_html_e( 'Molecular Formula', 'amida' ); ?></span><span class="amida-pdp__spec-value"><?php echo esc_html( $formula ); ?></span></div>
						<?php endif; ?>
						<?php if ( $cas ) : ?>
							<div class="amida-pdp__spec-row"><span class="amida-pdp__spec-label"><?php esc_html_e( 'CAS Number', 'amida' ); ?></span><span class="amida-pdp__spec-value"><?php echo esc_html( $cas ); ?></span></div>
						<?php endif; ?>
						<?php if ( $sequence ) : ?>
							<div class="amida-pdp__spec-row"><span class="amida-pdp__spec-label"><?php esc_html_e( 'Sequence Length', 'amida' ); ?></span><span class="amida-pdp__spec-value"><?php echo esc_html( $sequence ); ?></span></div>
						<?php endif; ?>
					</div>
				</div>

				<div class="amida-pdp__spec-card">
					<div class="amida-pdp__spec-eyebrow"><?php esc_html_e( 'STORAGE REQUIREMENTS', 'amida' ); ?></div>
					<div class="amida-pdp__spec-rows">
						<div class="amida-pdp__spec-row"><span class="amida-pdp__spec-label"><?php esc_html_e( 'Storage Temp', 'amida' ); ?></span><span class="amida-pdp__spec-value"><?php echo esc_html( $storage ?: '-20°C' ); ?></span></div>
						<div class="amida-pdp__spec-row"><span class="amida-pdp__spec-label"><?php esc_html_e( 'Shelf Life', 'amida' ); ?></span><span class="amida-pdp__spec-value"><?php echo esc_html( $shelf_life ?: '24 months' ); ?></span></div>
						<div class="amida-pdp__spec-row"><span class="amida-pdp__spec-label"><?php esc_html_e( 'Reconstitution', 'amida' ); ?></span><span class="amida-pdp__spec-value"><?php echo esc_html( $solubility ?: 'Bacteriostatic water' ); ?></span></div>
						<div class="amida-pdp__spec-row"><span class="amida-pdp__spec-label"><?php esc_html_e( 'Form', 'amida' ); ?></span><span class="amida-pdp__spec-value"><?php echo esc_html( $appearance ?: 'Lyophilized powder' ); ?></span></div>
					</div>
				</div>

				<div class="amida-pdp__spec-card">
					<div class="amida-pdp__spec-eyebrow"><?php esc_html_e( 'QUALITY DATA', 'amida' ); ?></div>
					<div class="amida-pdp__spec-rows">
						<div class="amida-pdp__spec-row"><span class="amida-pdp__spec-label"><?php esc_html_e( 'HPLC Purity', 'amida' ); ?></span><span class="amida-pdp__spec-value"><?php echo esc_html( $purity ?: '—' ); ?></span></div>
						<div class="amida-pdp__spec-row"><span class="amida-pdp__spec-label"><?php esc_html_e( 'Testing Method', 'amida' ); ?></span><span class="amida-pdp__spec-value"><?php esc_html_e( 'HPLC + MS', 'amida' ); ?></span></div>
						<div class="amida-pdp__spec-row"><span class="amida-pdp__spec-label"><?php esc_html_e( 'Batch', 'amida' ); ?></span><span class="amida-pdp__spec-value"><?php echo esc_html( $batch ?: '—' ); ?></span></div>
						<?php if ( $test_date ) : ?>
							<div class="amida-pdp__spec-row"><span class="amida-pdp__spec-label"><?php esc_html_e( 'Test Date', 'amida' ); ?></span><span class="amida-pdp__spec-value"><?php echo esc_html( $test_date ); ?></span></div>
						<?php endif; ?>
					</div>
				</div>
			</div>
		</div>
	</section>

	<section class="amida-pdp__ruo">
		<div class="amida-pdp__ruo-bar" aria-hidden="true"></div>
		<div class="amida-pdp__ruo-icon" aria-hidden="true">&#x2697;</div>
		<div class="amida-pdp__ruo-body">
			<div class="amida-pdp__ruo-title"><?php esc_html_e( 'FOR RESEARCH USE ONLY', 'amida' ); ?></div>
			<p class="amida-pdp__ruo-text">
				<?php esc_html_e( 'This compound is supplied strictly for in-vitro laboratory research. It is not a drug, food, or cosmetic and is not intended for diagnosis, treatment, prevention, or cure of any condition in humans or animals. By purchasing, you certify that you are a qualified researcher 21 years of age or older and will handle the product in accordance with your institutional protocols.', 'amida' ); ?>
			</p>
		</div>
	</section>

	<?php
	$related_ids = wc_get_related_products( $pid, 4 );
	if ( $related_ids ) :
		?>
		<section class="amida-pdp__related">
			<div class="amida-pdp__related-inner">
				<div class="amida-pdp__eyebrow"><?php esc_html_e( 'RELATED RESEARCH COMPOUNDS', 'amida' ); ?></div>
				<h2 class="amida-pdp__related-title"><?php esc_html_e( 'You may also research.', 'amida' ); ?></h2>
				<div class="amida-pdp__related-grid">
					<?php foreach ( $related_ids as $related_id ) :
						$rp = wc_get_product( $related_id );
						if ( ! $rp ) { continue; }
						$r_cats   = wp_get_post_terms( $related_id, 'product_cat' );
						$r_slug   = ( $r_cats && ! is_wp_error( $r_cats ) && isset( $r_cats[0] ) ) ? $r_cats[0]->slug : 'peptides';
						$r_purity = get_post_meta( $related_id, '_amida_purity', true );
						?>
						<a class="amida-related-card" data-tint="<?php echo esc_attr( sanitize_html_class( $r_slug ) ); ?>" href="<?php echo esc_url( get_permalink( $related_id ) ); ?>">
							<div class="amida-related-card__image">
								<div class="amida-vial" aria-hidden="true"><span class="amida-vial__cap"></span><span class="amida-vial__body"></span></div>
							</div>
							<div class="amida-related-card__body">
								<div class="amida-related-card__sku"><?php echo esc_html( $rp->get_name() ); ?></div>
								<div class="amida-related-card__hplc"><?php echo esc_html( sprintf( __( 'HPLC %s', 'amida' ), $r_purity ?: '—' ) ); ?></div>
								<div class="amida-related-card__footer">
									<span class="amida-related-card__price"><?php echo wp_kses_post( $rp->get_price_html() ); ?></span>
									<span class="amida-related-card__cta"><?php esc_html_e( 'VIEW →', 'amida' ); ?></span>
								</div>
							</div>
						</a>
					<?php endforeach; ?>
				</div>
			</div>
		</section>
		<?php
	endif;
	?>

</article>

<?php
endwhile;

get_footer( 'shop' );
