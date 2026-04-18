<?php
/**
 * Amida theme bootstrap.
 *
 * Loads the design system, registers menus/image sizes, and wires compliance
 * hooks. The heavy lifting (age gate, login wall, logger) lives in the
 * amida-compliance plugin. The theme stays presentational.
 *
 * @package Amida
 */

defined( 'ABSPATH' ) || exit;

define( 'AMIDA_THEME_VERSION', '2.0.0' );
define( 'AMIDA_THEME_DIR', get_stylesheet_directory() );
define( 'AMIDA_THEME_URI', get_stylesheet_directory_uri() );

require_once AMIDA_THEME_DIR . '/inc/setup.php';
require_once AMIDA_THEME_DIR . '/inc/enqueue.php';
require_once AMIDA_THEME_DIR . '/inc/template-tags.php';
require_once AMIDA_THEME_DIR . '/inc/woocommerce.php';
require_once AMIDA_THEME_DIR . '/inc/pwa.php';
