<?php
/**
 * 21+ penalty-of-perjury age gate modal. The language here is canonical —
 * do not change without legal sign-off.
 *
 * @package AmidaCompliance
 */

defined( 'ABSPATH' ) || exit;
?>
<div class="age-gate-backdrop" id="amida-age-gate" role="dialog" aria-modal="true" aria-labelledby="amida-age-gate-title">
	<div class="age-gate-modal" tabindex="-1">
		<div class="age-gate-modal__logo" aria-label="Amida">AMIDA</div>

		<h2 id="amida-age-gate-title" class="age-gate-modal__title">
			<?php esc_html_e( 'Entry Verification Required', 'amida-compliance' ); ?>
		</h2>
		<div class="age-gate-modal__subtitle">
			<?php esc_html_e( 'Research Access Portal', 'amida-compliance' ); ?>
		</div>

		<div class="age-gate-modal__disclaimer-heading">
			⚠ <?php esc_html_e( 'Mandatory Legal Disclaimer', 'amida-compliance' ); ?>
		</div>

		<div class="age-gate-modal__body">
			<p><?php
				printf(
					esc_html__( 'By clicking "I AGREE" and entering this website, you acknowledge and certify under penalty of perjury that you are at least %d years of age.', 'amida-compliance' ),
					(int) AMIDA_MIN_AGE
				);
			?></p>

			<section>
				<strong><?php esc_html_e( 'I. Research Use Only', 'amida-compliance' ); ?></strong>
				<?php esc_html_e( 'All products offered on this website are intended strictly for laboratory research purposes only. They are NOT for human or animal consumption, nor are they to be used as drugs, food additives, cosmetics, or household chemicals.', 'amida-compliance' ); ?>
			</section>

			<section>
				<strong><?php esc_html_e( 'II. Assumption of Risk', 'amida-compliance' ); ?></strong>
				<?php esc_html_e( 'You acknowledge that these substances have not been sterilized or tested by the FDA for safety or efficacy.', 'amida-compliance' ); ?>
			</section>

			<section>
				<strong><?php esc_html_e( 'III. Liability', 'amida-compliance' ); ?></strong>
				<?php
				printf(
					esc_html__( '%s shall not be held liable for any damages, consequential, incidental, or otherwise arising from the purchase, use, or misuse of these products. You agree to indemnify the company against any claims.', 'amida-compliance' ),
					esc_html( AMIDA_LEGAL_NAME )
				);
				?>
			</section>

			<label class="checkbox-row" style="margin-top:16px;padding:12px;background:rgba(193,125,60,.08);border-radius:8px;border:1px solid rgba(193,125,60,.2)">
				<input type="checkbox" id="amida-age-confirm" required>
				<span style="font-size:.86rem;font-weight:500;color:var(--charcoal)">
					<?php
					printf(
						esc_html__( 'I certify under penalty of perjury that I am at least %d years of age and accept all three disclaimers above.', 'amida-compliance' ),
						(int) AMIDA_MIN_AGE
					);
					?>
				</span>
			</label>

			<?php if ( Amida_NY_Enhanced::is_ny_visitor() ) : ?>
				<label class="checkbox-row" style="padding:10px">
					<input type="checkbox" id="amida-state-ny" name="amida_state_ny" value="NY">
					<span style="font-size:.82rem"><?php esc_html_e( 'New York resident — enhanced attestation applies.', 'amida-compliance' ); ?></span>
				</label>
			<?php endif; ?>
		</div>

		<div class="age-gate-modal__actions">
			<button type="button" class="btn" data-age-gate-action="agree" id="amida-age-gate-agree" aria-disabled="true" disabled>
				<?php esc_html_e( 'I Agree', 'amida-compliance' ); ?>
			</button>
			<button type="button" class="btn btn--ghost" data-age-gate-action="refuse">
				<?php esc_html_e( 'Disagree', 'amida-compliance' ); ?>
			</button>
		</div>

		<p style="text-align:center;color:var(--muted);font-size:.78rem;margin-top:16px">
			<?php esc_html_e( 'Registration required to access catalog. Not for human consumption.', 'amida-compliance' ); ?>
		</p>
	</div>
</div>
