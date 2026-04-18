<?php
/**
 * Offline fallback page. Served by the service worker when the network is
 * unreachable.
 *
 * @package Amida
 */
defined( 'ABSPATH' ) || exit;
?><!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Amida — Offline</title>
	<link rel="stylesheet" href="<?php echo esc_url( AMIDA_THEME_URI . '/assets/css/main.css' ); ?>">
</head>
<body>
	<main class="container" style="padding: 120px 0; text-align:center; max-width: 520px">
		<div class="hero__eyebrow"><?php esc_html_e( 'Offline', 'amida' ); ?></div>
		<h1><?php esc_html_e( "You're offline.", 'amida' ); ?></h1>
		<p style="color:var(--warm);font-size:1.05rem;line-height:1.7">
			<?php esc_html_e( 'The catalog requires an authenticated connection. Reconnect and reload to continue.', 'amida' ); ?>
		</p>
		<p><button class="btn" onclick="location.reload()"><?php esc_html_e( 'Retry', 'amida' ); ?></button></p>
	</main>
</body>
</html>
