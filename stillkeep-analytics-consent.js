(function () {
  'use strict';

  // Single site-wide GA4 property. This matches the measurement ID used on the homepage.
  var MEASUREMENT_ID = 'G-S9H3WHMV0T';
  var STORAGE_KEY = 'stillkeep_analytics_consent';
  var hasLoadedAnalytics = false;

  function getConsent() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function saveConsent(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) {}
  }

  function loadAnalytics() {
    if (hasLoadedAnalytics) return;
    hasLoadedAnalytics = true;

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', MEASUREMENT_ID, {
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });

    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(MEASUREMENT_ID);
    document.head.appendChild(script);
  }

  function deleteAnalyticsCookies() {
    document.cookie.split(';').forEach(function (cookie) {
      var name = cookie.split('=')[0].trim();
      if (name === '_gid' || name === '_gat' || name.indexOf('_ga') === 0) {
        document.cookie = name + '=; Max-Age=0; path=/; SameSite=Lax';
        document.cookie = name + '=; Max-Age=0; path=/; domain=.' + location.hostname + '; SameSite=Lax';
      }
    });
  }

  function disableAnalytics() {
    window['ga-disable-' + MEASUREMENT_ID] = true;
    if (window.gtag) {
      window.gtag('consent', 'update', { analytics_storage: 'denied' });
    }
    deleteAnalyticsCookies();
  }

  function enableAnalytics() {
    window['ga-disable-' + MEASUREMENT_ID] = false;
    loadAnalytics();
  }

  function ensureStyles() {
    if (document.getElementById('sk-consent-styles')) return;
    var style = document.createElement('style');
    style.id = 'sk-consent-styles';
    style.textContent =
      '#sk-consent{position:fixed;left:16px;right:16px;bottom:16px;z-index:2147483647;max-width:720px;margin:0 auto;padding:16px 18px;background:#fff;color:#241d32;border:1px solid rgba(91,43,217,.18);border-radius:18px;box-shadow:0 12px 36px rgba(36,29,50,.16);font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}' +
      '#sk-consent[hidden]{display:none!important}#sk-consent p{margin:0 0 12px}#sk-consent a{color:#5b2bd9}' +
      '#sk-consent-actions{display:flex;gap:9px;flex-wrap:wrap}' +
      '#sk-consent button,#sk-privacy-choices{appearance:none;border:1px solid rgba(91,43,217,.28);border-radius:999px;padding:9px 13px;font:600 13px/1 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;cursor:pointer;background:#fff;color:#5b2bd9}' +
      '#sk-consent .sk-accept{background:#5b2bd9;color:#fff;border-color:#5b2bd9}' +
      '#sk-privacy-choices{position:fixed;left:12px;bottom:12px;z-index:2147483646;padding:7px 10px;background:rgba(255,255,255,.96);box-shadow:0 4px 14px rgba(36,29,50,.1);font-size:11px}' +
      '@media(max-width:600px){#sk-consent{left:10px;right:10px;bottom:10px;padding:14px}#sk-consent-actions button{flex:1 1 auto}}';
    document.head.appendChild(style);
  }

  function showBanner() {
    ensureStyles();
    var existing = document.getElementById('sk-consent');
    if (existing) { existing.hidden = false; return; }

    var banner = document.createElement('div');
    banner.id = 'sk-consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Analytics privacy choices');
    banner.innerHTML =
      '<p><strong>Optional analytics</strong><br>Stillkeep uses Google Analytics only if you choose Accept, to understand which pages are useful. Analytics does not load before you choose. <a href="https://jhr1986.github.io/stillkeep-legal/privacy.html">Privacy</a>.</p>' +
      '<div id="sk-consent-actions"><button type="button" class="sk-reject">Reject analytics</button><button type="button" class="sk-accept">Accept analytics</button></div>';
    document.body.appendChild(banner);

    banner.querySelector('.sk-accept').addEventListener('click', function () {
      saveConsent('granted');
      enableAnalytics();
      banner.hidden = true;
      showChoicesButton();
    });
    banner.querySelector('.sk-reject').addEventListener('click', function () {
      saveConsent('denied');
      disableAnalytics();
      banner.hidden = true;
      showChoicesButton();
    });
  }

  function showChoicesButton() {
    ensureStyles();
    if (document.getElementById('sk-privacy-choices')) return;
    var button = document.createElement('button');
    button.id = 'sk-privacy-choices';
    button.type = 'button';
    button.textContent = 'Privacy choices';
    button.setAttribute('aria-label', 'Change analytics privacy choice');
    button.addEventListener('click', showBanner);
    document.body.appendChild(button);
  }

  function init() {
    var consent = getConsent();
    if (consent === 'granted') {
      enableAnalytics();
      showChoicesButton();
    } else if (consent === 'denied') {
      disableAnalytics();
      showChoicesButton();
    } else {
      disableAnalytics();
      showBanner();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
}());
