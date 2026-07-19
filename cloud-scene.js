/**
 * 🌥️ CLOUD SCENE — living background via VANTA.CLOUDS
 * Lazy-loaded, non-blocking. Never sits on the critical path.
 * Sits behind the existing CSS gradient/haze layers as a canvas;
 * if WebGL or the scripts fail, the original gradient background
 * is untouched and keeps doing its job.
 *
 * Pastel-punk palette pulled straight from index.html's own
 * --scene-* / --haze-gradient custom properties (see comments below).
 */
(function () {
    'use strict';

    // Skip entirely if the visitor prefers reduced motion — the CSS
    // aurora/haze animation already respects this, the WebGL layer should too.
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    // Palette per mood, converted from the app's own CSS custom properties.
    // idle:  --scene-top #fff8f1 / --scene-mid #fff1ec / --scene-bottom #eaf4ff / --scene-sun-mid #ffd8a2
    // yes (rain coming): cooler, more lavender-blue, deeper cloud shadow
    // no  (clear skies): warmer, sunnier, lighter cloud shadow
    // maybe: sits between the two, slightly hazier
    var MOODS = {
        idle: {
            skyColor: 0xdce8ff,
            cloudColor: 0xfff6ee,
            cloudShadowColor: 0xc9b8e8,
            sunColor: 0xffd8a2,
            sunGlareColor: 0xff9db0,
            sunlightColor: 0xfff0d8,
            speed: 0.9
        },
        loading: {
            skyColor: 0xe7e0ff,
            cloudColor: 0xfff2f8,
            cloudShadowColor: 0xcbb8e8,
            sunColor: 0xffcf9a,
            sunGlareColor: 0xff8fc0,
            sunlightColor: 0xffe6d4,
            speed: 1.4
        },
        yes: {
            skyColor: 0xd4ecff,
            cloudColor: 0xeef2ff,
            cloudShadowColor: 0x9aa8dd,
            sunColor: 0xd8c7ff,
            sunGlareColor: 0x96b8ff,
            sunlightColor: 0xeaf0ff,
            speed: 1.5
        },
        maybe: {
            skyColor: 0xdce8ff,
            cloudColor: 0xf5f0ff,
            cloudShadowColor: 0xb8b0e0,
            sunColor: 0xffe0b0,
            sunGlareColor: 0xb0a0ff,
            sunlightColor: 0xf0e8ff,
            speed: 1.0
        },
        no: {
            skyColor: 0xfff0d8,
            cloudColor: 0xfff8ee,
            cloudShadowColor: 0xe8c9a8,
            sunColor: 0xffd8a2,
            sunGlareColor: 0xff9db0,
            sunlightColor: 0xfff0d8,
            speed: 0.7
        }
    };

    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            var s = document.createElement('script');
            s.src = src;
            s.onload = resolve;
            s.onerror = reject;
            document.body.appendChild(s);
        });
    }

    function currentMood() {
        var state = (document.body.className || '').split(/\s+/)[0];
        return MOODS[state] || MOODS.idle;
    }

    function boot() {
        // No WebGL, no party. The CSS gradient background stays as-is.
        var canvas = document.createElement('canvas');
        var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return;

        var container = document.createElement('div');
        container.id = 'cloud-scene';
        container.setAttribute('aria-hidden', 'true');
        container.style.cssText =
            'position:fixed; inset:0; z-index:-3; opacity:0; ' +
            'transition:opacity 1.6s ease; pointer-events:none;';
        document.body.insertBefore(container, document.body.firstChild);

        Promise.all([
            loadScript('/vendor/three.min.js'),
            loadScript('/vendor/vanta.clouds.min.js')
        ]).then(function () {
            if (!window.VANTA || !window.VANTA.CLOUDS) return;

            var mood = currentMood();
            var effect = window.VANTA.CLOUDS(Object.assign({
                el: container,
                mouseControls: false,
                touchControls: false,
                gyroControls: false,
                minHeight: 200.0,
                minWidth: 200.0,
                backgroundAlpha: 0
            }, mood));

            // Fade the WebGL sky in once it's actually painted a frame.
            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    container.style.opacity = '1';
                });
            });

            // Retint clouds when the sky-check result changes mood.
            var lastState = (document.body.className || '').split(/\s+/)[0];
            var observer = new MutationObserver(function () {
                var state = (document.body.className || '').split(/\s+/)[0];
                if (state === lastState) return;
                lastState = state;
                var next = MOODS[state] || MOODS.idle;
                if (effect && typeof effect.setOptions === 'function') {
                    effect.setOptions(next);
                }
            });
            observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

            window.addEventListener('pagehide', function () {
                if (effect && typeof effect.destroy === 'function') effect.destroy();
            }, { once: true });
        }).catch(function () {
            // Script failed to load (offline, blocked, whatever) — remove the
            // empty layer and let the CSS gradient keep doing its job.
            container.remove();
        });
    }

    // Never compete with first paint or the app's own boot work.
    // requestIdleCallback when we have it, a small timeout fallback otherwise.
    if ('requestIdleCallback' in window) {
        requestIdleCallback(boot, { timeout: 2500 });
    } else {
        setTimeout(boot, 1200);
    }
})();
