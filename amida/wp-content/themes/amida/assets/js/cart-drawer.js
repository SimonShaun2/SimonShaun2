/**
 * Cart drawer open/close + accessory upsell toggles.
 */
(function () {
	'use strict';

	var drawer   = document.querySelector('.cart-drawer');
	var backdrop = document.querySelector('.cart-drawer-backdrop');
	if (!drawer || !backdrop) return;

	function open() {
		drawer.classList.add('is-open');
		drawer.setAttribute('aria-hidden', 'false');
		backdrop.classList.add('is-open');
		document.body.style.overflow = 'hidden';
	}
	function close() {
		drawer.classList.remove('is-open');
		drawer.setAttribute('aria-hidden', 'true');
		backdrop.classList.remove('is-open');
		document.body.style.overflow = '';
	}

	document.addEventListener('click', function (e) {
		if (e.target.closest('[data-cart-toggle]')) { e.preventDefault(); open(); }
		if (e.target.closest('[data-cart-close]'))  { e.preventDefault(); close(); }
	});
	document.addEventListener('keydown', function (e) {
		if (e.key === 'Escape' && drawer.classList.contains('is-open')) close();
	});

	// Accessory upsells add/remove via WC store AJAX.
	document.addEventListener('change', function (e) {
		var input = e.target.closest('[data-amida-upsell]');
		if (!input || typeof AmidaCart === 'undefined') return;

		var sku = input.getAttribute('data-amida-upsell');
		var body = new FormData();
		body.append('action', input.checked ? 'amida_add_upsell' : 'amida_remove_upsell');
		body.append('nonce', AmidaCart.nonce);
		body.append('sku', sku);

		fetch(AmidaCart.ajax_url, { method: 'POST', credentials: 'include', body: body })
			.then(function (r) { return r.json(); })
			.then(function () { location.reload(); });
	});

	// Remember first add-to-cart so the install banner can appear.
	document.addEventListener('submit', function (e) {
		if (e.target.matches('form.cart')) {
			try { localStorage.setItem('amida_first_add', '1'); } catch (err) {}
		}
	});
})();
