<?php
/**
 * Template Name: Amida — Legal Page
 *
 * Long-form legal content with compliance-friendly typography.
 *
 * @package Amida
 */

get_header();
?>
<section class="container" style="padding: 64px 0; max-width: 840px">
	<?php while ( have_posts() ) : the_post(); ?>
		<article>
			<header style="margin-bottom:32px">
				<div class="hero__eyebrow"><?php esc_html_e( 'Legal', 'amida' ); ?></div>
				<h1><?php the_title(); ?></h1>
				<p style="color:var(--muted);font-size:.88rem">
					<?php printf(
						esc_html__( 'Last updated: %s', 'amida' ),
						esc_html( get_the_modified_date( 'F j, Y' ) )
					); ?>
				</p>
			</header>

			<div class="entry-content" style="font-size:1rem;line-height:1.75;color:var(--charcoal)">
				<?php the_content(); ?>
			</div>
		</article>
	<?php endwhile; ?>
</section>
<?php get_footer();
