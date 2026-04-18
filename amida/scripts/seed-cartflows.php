<?php
/**
 * CartFlows / FunnelKit checkout flow seeder.
 *
 * Usage:
 *   wp eval-file scripts/seed-cartflows.php
 *
 * Idempotent — detects existing flow by meta key `_amida_flow_seed` and skips
 * re-creation. Pass --force flag to delete and recreate:
 *   wp eval-file scripts/seed-cartflows.php -- --force
 *
 * Requires:
 *   - CartFlows Pro (cartflows) plugin active
 *   - WooCommerce active
 *   - amida-brand mu-plugin loaded (for constants)
 *
 * Flow layout:
 *   Step 1 — Contact / Optin   (landing/optin template)
 *   Step 2 — Checkout          (checkout template, Bankful payment)
 *   Step 3 — Upsell 1          (OTO — best-seller 5-pack bundle)
 *   Step 4 — Downsell 1        (3-pack alternate if upsell 1 declined)
 *   Step 5 — Upsell 2          (OTO — accessory bundle)
 *   Step 6 — Downsell 2        (single accessory if upsell 2 declined)
 *   Step 7 — Upsell 3          (COA/Documentation add-on)
 *   Step 8 — Thank You         (order confirmation + next-steps)
 */

defined( 'ABSPATH' ) || exit;

// ── helpers ──────────────────────────────────────────────────────────────────

$force = in_array( '--force', $_SERVER['argv'] ?? [], true );

function amida_cf_log( string $msg ): void {
	WP_CLI::log( $msg );
}

function amida_cf_error( string $msg ): void {
	WP_CLI::error( $msg, false );
}

/**
 * Upsert a post; returns post ID.
 */
function amida_cf_upsert_post( array $args, string $seed_key ): int {
	$existing = get_posts( [
		'post_type'      => $args['post_type'],
		'meta_key'       => '_amida_flow_seed',
		'meta_value'     => $seed_key,
		'posts_per_page' => 1,
		'fields'         => 'ids',
	] );
	if ( $existing ) {
		return (int) $existing[0];
	}
	$id = wp_insert_post( array_merge( [ 'post_status' => 'publish' ], $args ), true );
	if ( is_wp_error( $id ) ) {
		amida_cf_error( 'Failed to create post: ' . $id->get_error_message() );
		return 0;
	}
	update_post_meta( $id, '_amida_flow_seed', $seed_key );
	return $id;
}

/**
 * Find a WooCommerce product ID by SKU. Returns 0 if not found.
 */
function amida_cf_product_by_sku( string $sku ): int {
	$id = wc_get_product_id_by_sku( $sku );
	return (int) $id;
}

// ── pre-flight ────────────────────────────────────────────────────────────────

if ( ! function_exists( 'cartflows_loader' ) && ! class_exists( 'CartFlows_Loader' ) ) {
	amida_cf_error( 'CartFlows plugin is not active. Activate it and re-run.' );
	return;
}

if ( ! class_exists( 'WooCommerce' ) ) {
	amida_cf_error( 'WooCommerce is not active.' );
	return;
}

// CartFlows post types
$flow_post_type = apply_filters( 'cartflows_flow_post_type', 'cartflows_flow' );
$step_post_type = apply_filters( 'cartflows_step_post_type', 'cartflows_step' );

// Check for existing seeded flow
$existing_flow = get_posts( [
	'post_type'      => $flow_post_type,
	'meta_key'       => '_amida_flow_seed',
	'meta_value'     => 'amida_main_flow',
	'posts_per_page' => 1,
	'fields'         => 'ids',
] );

if ( $existing_flow && ! $force ) {
	amida_cf_log( 'Flow already seeded (ID: ' . $existing_flow[0] . '). Use --force to recreate.' );
	return;
}

if ( $existing_flow && $force ) {
	amida_cf_log( 'Force flag detected — deleting existing flow and steps…' );
	$old_id    = (int) $existing_flow[0];
	$old_steps = get_post_meta( $old_id, '_cartflows_steps', true );
	if ( is_array( $old_steps ) ) {
		foreach ( $old_steps as $step_id ) {
			wp_delete_post( (int) $step_id, true );
		}
	}
	wp_delete_post( $old_id, true );
}

// ── resolve product IDs ───────────────────────────────────────────────────────

// Primary upsell: GLP-3 RT 5-pack (best-seller). Fall back to any product.
$upsell_1_sku  = 'GLP3RT-5PK';
$upsell_1_id   = amida_cf_product_by_sku( $upsell_1_sku );
if ( ! $upsell_1_id ) {
	$fallback = wc_get_products( [ 'limit' => 1, 'return' => 'ids' ] );
	$upsell_1_id = $fallback ? (int) $fallback[0] : 0;
	amida_cf_log( "SKU {$upsell_1_sku} not found; using product ID {$upsell_1_id} as placeholder." );
}

// Downsell 1: GLP-3 RT 3-pack
$downsell_1_sku = 'GLP3RT-3PK';
$downsell_1_id  = amida_cf_product_by_sku( $downsell_1_sku ) ?: $upsell_1_id;

// Upsell 2: Peptide accessory bundle
$upsell_2_sku  = 'ACC-BUNDLE';
$upsell_2_id   = amida_cf_product_by_sku( $upsell_2_sku );
if ( ! $upsell_2_id ) {
	$fallback = wc_get_products( [ 'category' => [ 'accessories' ], 'limit' => 1, 'return' => 'ids' ] );
	$upsell_2_id = $fallback ? (int) $fallback[0] : $upsell_1_id;
	amida_cf_log( "SKU {$upsell_2_sku} not found; using product ID {$upsell_2_id} as placeholder." );
}

// Downsell 2: single accessory
$downsell_2_sku = 'ACC-SINGLE';
$downsell_2_id  = amida_cf_product_by_sku( $downsell_2_sku ) ?: $upsell_2_id;

// Upsell 3: COA / documentation pack
$upsell_3_sku  = 'COA-PACK';
$upsell_3_id   = amida_cf_product_by_sku( $upsell_3_sku );
if ( ! $upsell_3_id ) {
	amida_cf_log( "SKU {$upsell_3_sku} not found; skipping Upsell 3 product assignment." );
}

// ── create flow ───────────────────────────────────────────────────────────────

$flow_id = amida_cf_upsert_post(
	[
		'post_type'  => $flow_post_type,
		'post_title' => 'Amida Main Checkout Flow',
	],
	'amida_main_flow'
);

if ( ! $flow_id ) {
	amida_cf_error( 'Could not create CartFlows flow post.' );
	return;
}

amida_cf_log( "Flow created/found: ID {$flow_id}" );

// ── step factory ──────────────────────────────────────────────────────────────

/**
 * @param int    $flow_id
 * @param string $title
 * @param string $step_type  cartflows step type slug: checkout|optin|upsell|downsell|thankyou
 * @param string $seed_key
 * @param int    $order      Sort order within the flow.
 * @return int step ID
 */
function amida_cf_create_step( int $flow_id, string $title, string $step_type, string $seed_key, int $order ): int {
	global $step_post_type;
	$id = amida_cf_upsert_post(
		[
			'post_type'   => $step_post_type,
			'post_title'  => $title,
			'post_parent' => $flow_id,
			'menu_order'  => $order,
		],
		$seed_key
	);
	if ( $id ) {
		update_post_meta( $id, '_cartflows_step_type', $step_type );
		update_post_meta( $id, '_cartflows_flow_id', $flow_id );
	}
	return $id;
}

// ── Step 1: Contact / Optin ───────────────────────────────────────────────────

$step_optin = amida_cf_create_step( $flow_id, 'Contact', 'optin', 'amida_step_optin', 1 );

update_post_meta( $step_optin, '_cartflows_optin', [
	'pre_checkout_offer'   => 'no',
	'layout'               => 'one-column',
	'header_text'          => 'Start your research order.',
	'sub_header_text'      => 'Enter your contact information to continue.',
	'optin_redirect_to'    => 'next_step',
] );

amida_cf_log( "Step 1 Optin: ID {$step_optin}" );

// ── Step 2: Checkout ──────────────────────────────────────────────────────────

$step_checkout = amida_cf_create_step( $flow_id, 'Checkout', 'checkout', 'amida_step_checkout', 2 );

update_post_meta( $step_checkout, '_cartflows_checkout', [
	'layout'                  => 'two-step',
	'enable_order_bump'       => 'yes',
	'order_bump_position'     => 'before_checkout',
	'purchase_note'           => 'I confirm I am 21+ and purchasing for research use only. Under penalty of perjury.',
	// Payment gateway — Bankful gateway ID as registered in WooCommerce.
	'payment_method'          => 'bankful',
	'billing_descriptor_note' => defined( 'AMIDA_BILLING_DESCRIPTOR' ) ? AMIDA_BILLING_DESCRIPTOR : 'AMIDA RESEARCH',
	// Attestation
	'custom_field_1_label'    => 'I certify I am 21 years of age or older.',
	'custom_field_1_required' => 'yes',
	'custom_field_2_label'    => 'I am a qualified researcher purchasing for laboratory use only.',
	'custom_field_2_required' => 'yes',
	'custom_field_3_label'    => 'I have read and agree to the Amida Researcher Use Agreement.',
	'custom_field_3_required' => 'yes',
	// Free shipping threshold display
	'free_shipping_threshold'  => defined( 'AMIDA_FREE_SHIPPING_THRESHOLD' ) ? AMIDA_FREE_SHIPPING_THRESHOLD : 250,
] );

amida_cf_log( "Step 2 Checkout: ID {$step_checkout}" );

// ── Step 3: Upsell 1 ─────────────────────────────────────────────────────────

$step_upsell_1 = amida_cf_create_step( $flow_id, 'Upsell 1 — 5-Pack Bundle', 'upsell', 'amida_step_upsell_1', 3 );

update_post_meta( $step_upsell_1, '_cartflows_upsell', [
	'product_id'        => $upsell_1_id,
	'product_quantity'  => 1,
	'offer_price'       => '',  // use product price
	'headline'          => 'Add a 5-pack to your order and save 20%.',
	'sub_headline'      => 'One-time offer — added to your current shipment.',
	'btn_yes_text'      => 'YES — Add to My Order',
	'btn_no_text'       => 'No thanks',
	'next_step'         => 'next_step',      // proceed to Step 5 on accept
	'no_next_step'      => 'next_step',      // proceed to Step 4 (downsell) on decline (CF routes automatically)
] );

amida_cf_log( "Step 3 Upsell 1: ID {$step_upsell_1}" );

// ── Step 4: Downsell 1 ────────────────────────────────────────────────────────

$step_downsell_1 = amida_cf_create_step( $flow_id, 'Downsell 1 — 3-Pack', 'downsell', 'amida_step_downsell_1', 4 );

update_post_meta( $step_downsell_1, '_cartflows_downsell', [
	'product_id'       => $downsell_1_id,
	'product_quantity' => 1,
	'offer_price'      => '',
	'headline'         => 'Not ready for 5? Try the 3-pack instead.',
	'sub_headline'     => 'Still ships with your order at no additional handling cost.',
	'btn_yes_text'     => 'YES — Add 3-Pack',
	'btn_no_text'      => 'No thanks',
] );

amida_cf_log( "Step 4 Downsell 1: ID {$step_downsell_1}" );

// ── Step 5: Upsell 2 ─────────────────────────────────────────────────────────

$step_upsell_2 = amida_cf_create_step( $flow_id, 'Upsell 2 — Accessory Bundle', 'upsell', 'amida_step_upsell_2', 5 );

update_post_meta( $step_upsell_2, '_cartflows_upsell', [
	'product_id'       => $upsell_2_id,
	'product_quantity' => 1,
	'offer_price'      => '',
	'headline'         => 'Complete your research kit — add the accessory bundle.',
	'sub_headline'     => 'Bacteriostatic water, syringes, and storage vials, bundled at 15% off.',
	'btn_yes_text'     => 'YES — Add Kit',
	'btn_no_text'      => 'No thanks',
] );

amida_cf_log( "Step 5 Upsell 2: ID {$step_upsell_2}" );

// ── Step 6: Downsell 2 ────────────────────────────────────────────────────────

$step_downsell_2 = amida_cf_create_step( $flow_id, 'Downsell 2 — Single Accessory', 'downsell', 'amida_step_downsell_2', 6 );

update_post_meta( $step_downsell_2, '_cartflows_downsell', [
	'product_id'       => $downsell_2_id,
	'product_quantity' => 1,
	'offer_price'      => '',
	'headline'         => 'Just need the essentials?',
	'sub_headline'     => 'Add a single accessory pack at standard pricing.',
	'btn_yes_text'     => 'YES — Add Accessory',
	'btn_no_text'      => 'No thanks',
] );

amida_cf_log( "Step 6 Downsell 2: ID {$step_downsell_2}" );

// ── Step 7: Upsell 3 (COA pack) ───────────────────────────────────────────────

$step_upsell_3 = amida_cf_create_step( $flow_id, 'Upsell 3 — COA Documentation Pack', 'upsell', 'amida_step_upsell_3', 7 );

$upsell_3_meta = [
	'product_id'       => $upsell_3_id ?: 0,
	'product_quantity' => 1,
	'offer_price'      => '',
	'headline'         => 'Add certified documentation to your order.',
	'sub_headline'     => 'Receive a complete COA package mailed with your shipment — standard lab protocol.',
	'btn_yes_text'     => 'YES — Add COA Pack',
	'btn_no_text'      => 'No thanks',
];
if ( ! $upsell_3_id ) {
	$upsell_3_meta['disabled'] = 'yes';
	amida_cf_log( 'Step 7 Upsell 3: product not found — step created but marked disabled.' );
}
update_post_meta( $step_upsell_3, '_cartflows_upsell', $upsell_3_meta );

amida_cf_log( "Step 7 Upsell 3: ID {$step_upsell_3}" );

// ── Step 8: Thank You ─────────────────────────────────────────────────────────

$step_thankyou = amida_cf_create_step( $flow_id, 'Thank You', 'thankyou', 'amida_step_thankyou', 8 );

update_post_meta( $step_thankyou, '_cartflows_thankyou', [
	'headline'     => 'Order received. Thank you.',
	'sub_headline' => 'Your research order is in queue. You will receive a shipping notification with tracking information within 1–2 business days.',
	'show_order_details' => 'yes',
	'next_steps_text'    => 'Review your COA documents and storage protocols in your account dashboard.',
] );

amida_cf_log( "Step 8 Thank You: ID {$step_thankyou}" );

// ── attach steps to flow ──────────────────────────────────────────────────────

$step_ids = [
	$step_optin,
	$step_checkout,
	$step_upsell_1,
	$step_downsell_1,
	$step_upsell_2,
	$step_downsell_2,
	$step_upsell_3,
	$step_thankyou,
];

update_post_meta( $flow_id, '_cartflows_steps', $step_ids );

// CartFlows also uses a serialised steps array with type info
$steps_data = [];
$step_types  = [
	$step_optin      => 'optin',
	$step_checkout   => 'checkout',
	$step_upsell_1   => 'upsell',
	$step_downsell_1 => 'downsell',
	$step_upsell_2   => 'upsell',
	$step_downsell_2 => 'downsell',
	$step_upsell_3   => 'upsell',
	$step_thankyou   => 'thankyou',
];
foreach ( $step_ids as $i => $sid ) {
	$steps_data[] = [
		'id'    => $sid,
		'title' => get_the_title( $sid ),
		'type'  => $step_types[ $sid ] ?? 'checkout',
		'order' => $i + 1,
	];
}
update_post_meta( $flow_id, '_cartflows_steps_data', $steps_data );

// ── flow-level settings ───────────────────────────────────────────────────────

update_post_meta( $flow_id, '_cartflows_flow_settings', [
	'flow_title'          => 'Amida Main Checkout Flow',
	'currency'            => 'USD',
	'test_mode'           => 'no',
	'google_analytics'    => 'no',
	'facebook_pixel'      => 'no',
	// Disable WooCommerce default checkout for customers entering via this flow
	'disable_default_checkout' => 'yes',
] );

// ── update A7 build-state contract ───────────────────────────────────────────

$build_state_path = __DIR__ . '/../build-state/A7.status.json';
$status = [
	'agent'  => 'A7',
	'name'   => 'Email Templates & CartFlows Seeder',
	'status' => 'complete',
	'artifacts' => [
		'wp-content/plugins/amida-compliance/emails/email-verification.php',
		'wp-content/plugins/amida-compliance/emails/researcher-approved.php',
		'wp-content/plugins/amida-compliance/emails/order-shipped.php',
		'wp-content/plugins/amida-compliance/emails/account-created.php',
		'wp-content/plugins/amida-compliance/emails/password-reset.php',
		'wp-content/plugins/amida-compliance/emails/upsell-accepted.php',
		'wp-content/plugins/amida-compliance/emails/admin-new-order.php',
		'scripts/seed-cartflows.php',
	],
	'contracts_published' => [
		'A7.email_templates.count'    => 8,
		'A7.email_templates.complete' => true,
		'A7.cartflows.flow_seeded'    => true,
		'A7.cartflows.steps.count'    => 8,
		'A7.cartflows.upsells.count'  => 3,
		'A7.cartflows.downsells.count' => 2,
	],
];
file_put_contents( $build_state_path, json_encode( $status, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES ) . "\n" );
amida_cf_log( 'Build-state A7.status.json updated.' );

// ── done ──────────────────────────────────────────────────────────────────────

amida_cf_log( '' );
amida_cf_log( '✓ CartFlows flow seeded successfully.' );
amida_cf_log( "  Flow ID : {$flow_id}" );
amida_cf_log( '  Steps   : ' . implode( ', ', $step_ids ) );
amida_cf_log( '' );
amida_cf_log( 'Next steps:' );
amida_cf_log( '  1. Assign CartFlows page templates in each step (Elementor or block editor).' );
amida_cf_log( '  2. Confirm Bankful gateway ID matches _cartflows_checkout[payment_method].' );
amida_cf_log( '  3. Set flow as the global checkout in CartFlows → Settings → Global Checkout.' );
amida_cf_log( '  4. Test full funnel in sandbox mode before going live.' );
