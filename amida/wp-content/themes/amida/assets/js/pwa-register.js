/**
 * Register the service worker and manage the install banner.
 *
 * The install prompt is surfaced on the 2nd visit OR after the user's first
 * cart-add. Both checks use localStorage to avoid nagging.
 */
(function () {
	if (!('serviceWorker' in navigator)) return;

	window.addEventListener('load', function () {
		navigator.serviceWorker.register('/sw.js', { scope: '/' })
			.catch(function (err) { console.warn('Amida SW registration failed:', err); });
	});

	// Track visit count.
	try {
		var visits = parseInt(localStorage.getItem('amida_visits') || '0', 10) + 1;
		localStorage.setItem('amida_visits', String(visits));
	} catch (e) { /* storage blocked */ }

	var deferred;
	window.addEventListener('beforeinstallprompt', function (e) {
		e.preventDefault();
		deferred = e;
		maybeShowBanner();
	});

	window.addEventListener('appinstalled', function () {
		try { localStorage.setItem('amida_installed', '1'); } catch (e) {}
	});

	function maybeShowBanner() {
		try {
			if (localStorage.getItem('amida_installed') === '1') return;
			if (localStorage.getItem('amida_install_dismissed_at')) return;

			var visits   = parseInt(localStorage.getItem('amida_visits') || '0', 10);
			var carted   = localStorage.getItem('amida_first_add') === '1';
			if (visits < 2 && !carted) return;
		} catch (e) { return; }

		if (document.getElementById('amida-install-banner')) return;

		var banner = document.createElement('div');
		banner.id = 'amida-install-banner';
		banner.style.cssText = 'position:fixed;left:16px;right:16px;bottom:88px;z-index:95;background:var(--cream-light);border:1px solid var(--border);border-radius:14px;padding:14px 16px;display:flex;gap:12px;align-items:center;box-shadow:var(--shadow-md)';
		banner.innerHTML = '<div style="flex:1;font-size:.88rem"><strong>Install Amida</strong><br><span style="color:var(--muted);font-size:.8rem">Quick access from your home screen.</span></div>' +
			'<button type="button" id="amida-install-yes" class="btn btn--sm">Install</button>' +
			'<button type="button" id="amida-install-no"  class="btn btn--ghost btn--sm" aria-label="Dismiss">✕</button>';
		document.body.appendChild(banner);

		document.getElementById('amida-install-yes').addEventListener('click', function () {
			if (!deferred) return;
			deferred.prompt();
			deferred.userChoice.then(function () { deferred = null; banner.remove(); });
		});
		document.getElementById('amida-install-no').addEventListener('click', function () {
			try { localStorage.setItem('amida_install_dismissed_at', String(Date.now())); } catch (e) {}
			banner.remove();
		});
	}
})();
