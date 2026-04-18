<?php
/**
 * Template Name: Amida — Auth (Login/Register)
 *
 * Unified auth page. The page's slug (`login` or `register`) decides which
 * tab starts active. Works with the compliance plugin's auth handlers.
 *
 * @package Amida
 */

get_header();

$slug         = get_post_field( 'post_name', get_queried_object_id() );
$active       = ( 'register' === $slug ) ? 'register' : 'login';
$redirect_to  = isset( $_GET['redirect'] ) ? esc_url_raw( $_GET['redirect'] ) : home_url( '/catalog' );
$login_errors = apply_filters( 'amida/login_errors', '' );
?>

<div class="auth-split">
	<div class="auth-split__brand">
		<h2><?php esc_html_e( 'Documented. Verified. Trusted.', 'amida' ); ?></h2>
		<p>
			<?php esc_html_e( 'In accordance with industry regulations, users must log in to access product details and browse our catalog. Every session re-attests research-use and age eligibility before the catalog unlocks.', 'amida' ); ?>
		</p>
		<div style="margin-top:40px;display:grid;gap:14px;font-size:.92rem;color:rgba(245,240,232,.82)">
			<div>✓ <?php esc_html_e( 'HPLC-verified batches', 'amida' ); ?></div>
			<div>✓ <?php esc_html_e( 'Third-party independent labs', 'amida' ); ?></div>
			<div>✓ <?php esc_html_e( 'Same-day domestic shipping', 'amida' ); ?></div>
			<div>✓ <?php esc_html_e( 'Direct support via Telegram', 'amida' ); ?></div>
		</div>
	</div>

	<div class="auth-card" data-amida-auth>
		<div class="auth-tabs" role="tablist">
			<button type="button" class="auth-tab <?php echo 'login' === $active ? 'is-active' : ''; ?>" data-auth-tab="login" role="tab"><?php esc_html_e( 'Sign In', 'amida' ); ?></button>
			<button type="button" class="auth-tab <?php echo 'register' === $active ? 'is-active' : ''; ?>" data-auth-tab="register" role="tab"><?php esc_html_e( 'Register', 'amida' ); ?></button>
		</div>

		<div class="auth-gate-banner">
			<?php esc_html_e( 'In accordance with industry regulations, users must log in to access product details and browse our catalog.', 'amida' ); ?>
		</div>

		<?php if ( $login_errors ) : ?>
			<div style="padding:12px 14px;background:rgba(184,64,64,.08);border:1px solid rgba(184,64,64,.3);border-radius:var(--radius-sm);color:var(--error);font-size:.88rem;margin-bottom:18px">
				<?php echo wp_kses_post( $login_errors ); ?>
			</div>
		<?php endif; ?>

		<!-- Sign in form -->
		<form class="auth-form" data-auth-form="login" <?php echo 'login' === $active ? '' : 'hidden'; ?> method="post" action="<?php echo esc_url( home_url( '/wp-login.php' ) ); ?>">
			<div style="display:grid;gap:14px">
				<div>
					<label for="login-email"><?php esc_html_e( 'Email', 'amida' ); ?></label>
					<input id="login-email" type="email" name="log" required autocomplete="email">
				</div>
				<div>
					<label for="login-password"><?php esc_html_e( 'Password', 'amida' ); ?></label>
					<input id="login-password" type="password" name="pwd" required autocomplete="current-password">
				</div>

				<label class="checkbox-row">
					<input type="checkbox" name="amida_ruo_reattest" required>
					<span>
						<?php esc_html_e( 'I certify under penalty of perjury that I am 21+ and agree to the Research Use Only policy. Products are not for human or animal consumption.', 'amida' ); ?>
					</span>
				</label>

				<input type="hidden" name="redirect_to" value="<?php echo esc_attr( $redirect_to ); ?>">
				<?php wp_nonce_field( 'amida_login', 'amida_login_nonce' ); ?>

				<button type="submit" class="btn btn--block btn--lg"><?php esc_html_e( 'Sign In', 'amida' ); ?></button>

				<div style="text-align:center;margin-top:12px">
					<a href="<?php echo esc_url( wp_lostpassword_url() ); ?>" style="font-size:.88rem;color:var(--muted)">
						<?php esc_html_e( 'Forgot password?', 'amida' ); ?>
					</a>
				</div>
			</div>
		</form>

		<!-- Register form -->
		<form class="auth-form" data-auth-form="register" <?php echo 'register' === $active ? '' : 'hidden'; ?> method="post" action="<?php echo esc_url( home_url( '/wp-login.php?action=register' ) ); ?>">
			<div style="display:grid;gap:14px">
				<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
					<div>
						<label for="reg-first"><?php esc_html_e( 'First Name', 'amida' ); ?></label>
						<input id="reg-first" name="first_name" required autocomplete="given-name">
					</div>
					<div>
						<label for="reg-last"><?php esc_html_e( 'Last Name', 'amida' ); ?></label>
						<input id="reg-last" name="last_name" required autocomplete="family-name">
					</div>
				</div>

				<div>
					<label for="reg-email"><?php esc_html_e( 'Email', 'amida' ); ?></label>
					<input id="reg-email" type="email" name="user_email" required autocomplete="email">
				</div>

				<div>
					<label for="reg-password"><?php esc_html_e( 'Password', 'amida' ); ?></label>
					<input id="reg-password" type="password" name="user_pass" required minlength="10" autocomplete="new-password">
				</div>

				<div>
					<label for="reg-context"><?php esc_html_e( 'Research Context', 'amida' ); ?></label>
					<select id="reg-context" name="amida_research_context" required>
						<option value=""><?php esc_html_e( 'Select…', 'amida' ); ?></option>
						<option value="academic"><?php esc_html_e( 'Academic Researcher', 'amida' ); ?></option>
						<option value="independent_lab"><?php esc_html_e( 'Independent Laboratory', 'amida' ); ?></option>
						<option value="clinical"><?php esc_html_e( 'Clinical Research', 'amida' ); ?></option>
						<option value="biotech"><?php esc_html_e( 'Biotech', 'amida' ); ?></option>
						<option value="other"><?php esc_html_e( 'Other', 'amida' ); ?></option>
					</select>
				</div>

				<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
					<div>
						<label for="reg-state"><?php esc_html_e( 'State', 'amida' ); ?></label>
						<input id="reg-state" name="amida_state" maxlength="2" required placeholder="e.g. WY">
					</div>
					<div>
						<label for="reg-institution"><?php esc_html_e( 'Institution (optional)', 'amida' ); ?></label>
						<input id="reg-institution" name="amida_institution">
					</div>
				</div>

				<div>
					<label for="reg-purpose"><?php esc_html_e( 'Research Purpose (optional)', 'amida' ); ?></label>
					<textarea id="reg-purpose" name="amida_research_purpose" rows="2"></textarea>
				</div>

				<label class="checkbox-row">
					<input type="checkbox" name="amida_agree_ruo" required>
					<span><?php esc_html_e( 'I agree compounds are for research use only and not for human or animal consumption.', 'amida' ); ?></span>
				</label>
				<label class="checkbox-row">
					<input type="checkbox" name="amida_agree_policies" required>
					<span><?php esc_html_e( 'I agree to the Terms of Service, Privacy Policy, Shipping Policy, and Refund Policy.', 'amida' ); ?></span>
				</label>
				<label class="checkbox-row">
					<input type="checkbox" name="amida_agree_age" required>
					<span><?php esc_html_e( 'I certify under penalty of perjury that I am at least 21 years of age.', 'amida' ); ?></span>
				</label>

				<input type="hidden" name="redirect_to" value="<?php echo esc_attr( $redirect_to ); ?>">
				<?php wp_nonce_field( 'amida_register', 'amida_register_nonce' ); ?>

				<button type="submit" class="btn btn--block btn--lg"><?php esc_html_e( 'Create Researcher Account', 'amida' ); ?></button>
			</div>
		</form>
	</div>
</div>

<script>
(function () {
	var tabs = document.querySelectorAll('[data-auth-tab]');
	var forms = document.querySelectorAll('[data-auth-form]');
	tabs.forEach(function (t) {
		t.addEventListener('click', function () {
			var target = t.getAttribute('data-auth-tab');
			tabs.forEach(function (x) { x.classList.toggle('is-active', x === t); });
			forms.forEach(function (f) { f.hidden = f.getAttribute('data-auth-form') !== target; });
		});
	});
})();
</script>

<?php get_footer();
