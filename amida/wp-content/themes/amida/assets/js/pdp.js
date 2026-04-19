/**
 * PDP (single-product) interactions: thumbnail gallery, quantity stepper,
 * pill selectors (mg + pack size), live ATC price update.
 *
 * @package Amida
 */
( function () {
	'use strict';

	const pdp = document.querySelector( '.amida-pdp' );
	if ( ! pdp ) return;

	// ── Thumbnail switcher ───────────────────────────────────────────────────
	const thumbs = pdp.querySelectorAll( '.amida-pdp__thumb' );
	thumbs.forEach( ( btn ) => {
		btn.addEventListener( 'click', () => {
			thumbs.forEach( ( t ) => t.classList.remove( 'is-active' ) );
			btn.classList.add( 'is-active' );
		} );
	} );

	// ── Quantity stepper ─────────────────────────────────────────────────────
	const qtyInput = pdp.querySelector( '.amida-pdp__qty-input' );
	pdp.querySelectorAll( '.amida-pdp__qty-btn' ).forEach( ( btn ) => {
		btn.addEventListener( 'click', () => {
			const step = parseInt( btn.dataset.step || '0', 10 );
			const min  = parseInt( qtyInput.min || '1', 10 );
			const max  = parseInt( qtyInput.max || '99', 10 );
			const next = Math.min( max, Math.max( min, ( parseInt( qtyInput.value, 10 ) || 1 ) + step ) );
			qtyInput.value = next;
			qtyInput.dispatchEvent( new Event( 'change', { bubbles: true } ) );
		} );
	} );

	// ── Pill selector (shared for mg + pack) ─────────────────────────────────
	const activatePill = ( group, label ) => {
		group.querySelectorAll( '.amida-pill' ).forEach( ( p ) => p.classList.remove( 'is-active' ) );
		label.classList.add( 'is-active' );
	};

	pdp.querySelectorAll( '.amida-pdp__mg-pills, .amida-pdp__pack-pills' ).forEach( ( group ) => {
		group.addEventListener( 'change', ( e ) => {
			const input = e.target;
			if ( input.tagName !== 'INPUT' ) return;
			const label = input.closest( '.amida-pill' );
			if ( label ) activatePill( group, label );
		} );
	} );

	// ── Live ATC price update when pack size changes ─────────────────────────
	const atcPrice = pdp.querySelector( '.amida-pdp__atc-price' );
	const priceBlock = pdp.querySelector( '.amida-pdp__price' );
	pdp.querySelectorAll( 'input[name="amida_pack"]' ).forEach( ( input ) => {
		input.addEventListener( 'change', () => {
			const sib = input.closest( '.amida-pill' ).querySelector( '.amida-pill__secondary' );
			if ( sib && atcPrice ) atcPrice.innerHTML = sib.innerHTML;
			if ( sib && priceBlock ) priceBlock.innerHTML = sib.innerHTML;
		} );
	} );
} )();
