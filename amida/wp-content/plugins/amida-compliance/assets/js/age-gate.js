/**
 * Age gate modal interactions.
 *
 * Wires the checkbox-enabled agree button, fires the AJAX submit, redirects
 * on success, and traps focus inside the modal while it's open.
 */
(function () {
	'use strict';

	var modal = document.getElementById('amida-age-gate');
	if (!modal || typeof AmidaAgeGate === 'undefined') return;

	var agreeBtn  = document.getElementById('amida-age-gate-agree');
	var checkbox  = document.getElementById('amida-age-confirm');
	var nyBox     = document.getElementById('amida-state-ny');

	document.body.style.overflow = 'hidden';

	// Focus trap.
	var focusable = modal.querySelectorAll('button, input, [tabindex]:not([tabindex="-1"])');
	if (focusable.length) focusable[0].focus();

	modal.addEventListener('keydown', function (e) {
		if (e.key !== 'Tab') return;
		var first = focusable[0], last = focusable[focusable.length - 1];
		if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
		else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
	});

	checkbox.addEventListener('change', function () {
		var ok = checkbox.checked;
		agreeBtn.disabled = !ok;
		agreeBtn.setAttribute('aria-disabled', ok ? 'false' : 'true');
	});

	modal.addEventListener('click', function (e) {
		var action = e.target.getAttribute('data-age-gate-action');
		if (!action) return;
		submit(action);
	});

	function submit(decision) {
		if (decision === 'agree' && !checkbox.checked) return;

		var body = new FormData();
		body.append('action',   'amida_age_gate');
		body.append('nonce',    AmidaAgeGate.nonce);
		body.append('decision', decision);
		body.append('agree_1',  decision === 'agree' ? '1' : '');
		body.append('agree_2',  decision === 'agree' ? '1' : '');
		body.append('agree_3',  decision === 'agree' ? '1' : '');
		body.append('agree_age', checkbox.checked ? '1' : '');
		body.append('state',    nyBox && nyBox.checked ? 'NY' : '');
		body.append('redirect', '/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));

		fetch(AmidaAgeGate.ajax_url, {
			method: 'POST',
			credentials: 'include',
			body: body,
		})
			.then(function (r) { return r.json(); })
			.then(function (res) {
				if (res && res.success && res.data && res.data.redirect) {
					window.location.href = res.data.redirect;
				} else {
					agreeBtn.textContent = 'Try again';
					agreeBtn.classList.add('btn--amber');
				}
			})
			.catch(function () {
				agreeBtn.textContent = 'Network error. Retry.';
			});
	}
})();
