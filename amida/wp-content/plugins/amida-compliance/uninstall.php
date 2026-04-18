<?php
/**
 * Uninstall safety net. We do NOT drop the compliance tables on uninstall —
 * they are regulatory records. Delete them manually via wp-cli if you really
 * mean it.
 *
 * @package AmidaCompliance
 */

defined( 'WP_UNINSTALL_PLUGIN' ) || exit;

// Remove custom roles only. Data tables stay.
remove_role( 'researcher' );
remove_role( 'verified_researcher' );
