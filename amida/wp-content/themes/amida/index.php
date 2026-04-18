<?php
/**
 * Fallback index. Most routes have dedicated templates.
 *
 * @package Amida
 */
get_header();
?>
<section class="container" style="padding: 64px 0">
	<?php if ( have_posts() ) : ?>
		<?php while ( have_posts() ) : the_post(); ?>
			<article <?php post_class(); ?>>
				<header>
					<h1><?php the_title(); ?></h1>
				</header>
				<div class="entry-content">
					<?php the_content(); ?>
				</div>
			</article>
		<?php endwhile; ?>
	<?php else : ?>
		<h1><?php esc_html_e( 'Page not found', 'amida' ); ?></h1>
		<p><?php esc_html_e( 'The page you requested could not be located.', 'amida' ); ?></p>
	<?php endif; ?>
</section>
<?php get_footer();
