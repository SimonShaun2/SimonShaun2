<?php
/**
 * Compliance log table + writer.
 *
 * Every regulated action in the site — age-gate, login attestation, checkout
 * attestation, product view, order placed — flows through Amida_Compliance_Log::log().
 * That event log is what you hand to the processor when they audit you.
 *
 * @package AmidaCompliance
 */

defined( 'ABSPATH' ) || exit;

class Amida_Compliance_Log {

	public static function init(): void {
		// No runtime hooks — this is a writer/reader library consumed by other modules.
	}

	/**
	 * Called on plugin activation. Runs through dbDelta so re-activations don't
	 * wipe data.
	 */
	public static function install(): void {
		global $wpdb;
		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		$charset = $wpdb->get_charset_collate();

		$sql = "CREATE TABLE {$wpdb->prefix}amida_compliance_log (
			id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
			user_id BIGINT UNSIGNED NULL,
			session_id VARCHAR(64) NULL,
			event_type VARCHAR(50) NOT NULL,
			event_data LONGTEXT NULL,
			ip_hash VARCHAR(64) NULL,
			user_agent VARCHAR(500) NULL,
			state_code VARCHAR(2) NULL,
			enhanced_flow_triggered TINYINT(1) NOT NULL DEFAULT 0,
			created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			KEY idx_user (user_id),
			KEY idx_event (event_type),
			KEY idx_date (created_at),
			KEY idx_state (state_code)
		) $charset;";

		dbDelta( $sql );

		$sql2 = "CREATE TABLE {$wpdb->prefix}amida_batch_log (
			id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
			order_id BIGINT UNSIGNED NOT NULL,
			product_id BIGINT UNSIGNED NOT NULL,
			batch_number VARCHAR(50) NOT NULL,
			coa_file_url VARCHAR(500) NULL,
			shipped_at DATETIME NULL,
			created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			KEY idx_order (order_id),
			KEY idx_batch (batch_number)
		) $charset;";

		dbDelta( $sql2 );

		// Seed salt if not set.
		if ( ! get_option( 'amida_compliance_salt' ) ) {
			update_option( 'amida_compliance_salt', wp_generate_password( 40, true, true ), false );
		}
	}

	/**
	 * Write a compliance event.
	 *
	 * @param string           $event_type one of AMIDA_EVENT_TYPES.
	 * @param array|null       $data       structured payload (JSON-encoded on write).
	 * @param int|null         $user_id    optional user id (defaults to current user).
	 * @param string|null      $state      optional 2-letter state code.
	 */
	public static function log( string $event_type, ?array $data = null, ?int $user_id = null, ?string $state = null ): int {
		global $wpdb;

		if ( ! in_array( $event_type, AMIDA_EVENT_TYPES, true ) ) {
			// Unknown event types are coerced to a safe label so we still record SOMETHING.
			$event_type = 'unknown_' . substr( md5( $event_type ), 0, 8 );
		}

		$session_id = self::session_id();

		$ok = $wpdb->insert(
			$wpdb->prefix . 'amida_compliance_log',
			[
				'user_id'                 => $user_id ?: ( get_current_user_id() ?: null ),
				'session_id'              => $session_id,
				'event_type'              => $event_type,
				'event_data'              => $data ? wp_json_encode( $data ) : null,
				'ip_hash'                 => amida_hash_ip(),
				'user_agent'              => substr( (string) ( $_SERVER['HTTP_USER_AGENT'] ?? '' ), 0, 500 ),
				'state_code'              => $state ? strtoupper( substr( $state, 0, 2 ) ) : null,
				'enhanced_flow_triggered' => $state && in_array( strtoupper( $state ), (array) maybe_unserialize( defined( 'AMIDA_ENHANCED_FLOW_STATES' ) ? AMIDA_ENHANCED_FLOW_STATES : '' ), true ) ? 1 : 0,
			],
			[ '%d', '%s', '%s', '%s', '%s', '%s', '%s', '%d' ]
		);

		return $ok ? (int) $wpdb->insert_id : 0;
	}

	/**
	 * Per-session anonymous id. Stored in a cookie, rotated on logout.
	 */
	public static function session_id(): string {
		if ( ! empty( $_COOKIE['amida_sid'] ) ) {
			return preg_replace( '/[^a-f0-9]/i', '', $_COOKIE['amida_sid'] );
		}
		$sid = bin2hex( random_bytes( 16 ) );
		if ( ! headers_sent() ) {
			setcookie(
				'amida_sid',
				$sid,
				[
					'expires'  => time() + DAY_IN_SECONDS * 30,
					'path'     => '/',
					'domain'   => COOKIE_DOMAIN,
					'secure'   => is_ssl(),
					'httponly' => true,
					'samesite' => 'Lax',
				]
			);
		}
		return $sid;
	}

	/**
	 * Query helper for the admin UI + CSV exporter.
	 */
	public static function query( array $args = [] ): array {
		global $wpdb;
		$args  = wp_parse_args( $args, [
			'event_type' => null,
			'user_id'    => null,
			'state'      => null,
			'since'      => null,
			'until'      => null,
			'limit'      => 100,
			'offset'     => 0,
		] );
		$where = [ '1=1' ];
		$vals  = [];
		if ( $args['event_type'] ) { $where[] = 'event_type = %s'; $vals[] = $args['event_type']; }
		if ( $args['user_id'] )    { $where[] = 'user_id = %d';    $vals[] = (int) $args['user_id']; }
		if ( $args['state'] )      { $where[] = 'state_code = %s'; $vals[] = strtoupper( $args['state'] ); }
		if ( $args['since'] )      { $where[] = 'created_at >= %s'; $vals[] = $args['since']; }
		if ( $args['until'] )      { $where[] = 'created_at <= %s'; $vals[] = $args['until']; }
		$sql = 'SELECT * FROM ' . $wpdb->prefix . 'amida_compliance_log WHERE ' . implode( ' AND ', $where ) . ' ORDER BY id DESC LIMIT %d OFFSET %d';
		$vals[] = (int) $args['limit'];
		$vals[] = (int) $args['offset'];
		return (array) $wpdb->get_results( $wpdb->prepare( $sql, $vals ) );
	}
}
