/**
 * 🪶 WEIGHTLESS — vendored for isitgoingtorain
 * Pure Web Audio procedural sound engine. 0kb assets. 100% Soul.
 * Upstream: @softstack/weightless (MIT, by pibulus)
 * Do not edit here for behavior changes — change upstream + re-vendor.
 */
(function () {
    'use strict';

    var MASTER_LEVEL = 0.65;
    var MIN_GAIN = 0.0001;

    var centsToRatio = function (cents) {
        return Math.pow(2, cents / 1200);
    };

    var WEIGHTLESS_VOICES = {
        tap: {
            type: "triangle",
            lowpass: 2800,
            attack: 0.006,
            partials: [{ ratio: 2.01, gain: 0.2, type: "sine" }],
        },
        bloom: {
            type: "sine",
            lowpass: 3800,
            attack: 0.01,
            partials: [{ ratio: 1.5, gain: 0.12, type: "triangle" }],
        },
        knock: {
            type: "sine",
            lowpass: 1400,
            attack: 0.005,
            bendCents: -60,
        },
        sparkle: {
            type: "sine",
            lowpass: 4300,
            attack: 0.004,
            partials: [{ ratio: 2, gain: 0.15, type: "sine" }],
        },
        warn: {
            type: "sine",
            lowpass: 1200,
            attack: 0.007,
            bendCents: -45,
        },
    };

    var WEIGHTLESS_CUES = {
        select: {
            cooldownMs: 45,
            detuneCents: 7,
            variants: [
                [{ frequency: 620, duration: 0.046, gain: 0.022, voice: "tap" }],
                [{ frequency: 700, duration: 0.04, gain: 0.019, voice: "bloom" }],
            ],
        },
        success: {
            cooldownMs: 200,
            detuneCents: 10,
            variants: [
                [
                    { frequency: 523.25, duration: 0.07, gain: 0.03, voice: "tap" },
                    { frequency: 659.25, offset: 0.06, duration: 0.08, gain: 0.025, voice: "bloom" },
                    { frequency: 783.99, offset: 0.12, duration: 0.14, gain: 0.02, voice: "sparkle" },
                ],
            ],
        },
        error: {
            cooldownMs: 150,
            variants: [
                [
                    { frequency: 220, duration: 0.12, gain: 0.03, voice: "warn" },
                    { frequency: 180, offset: 0.08, duration: 0.15, gain: 0.025, voice: "warn" },
                ],
            ],
        },
    };

    function Weightless(options) {
        options = options || {};
        this.context = null;
        this.masterGain = null;
        this.enabled = options.enabled !== undefined ? options.enabled : true;
        this.volume = options.volume !== undefined ? options.volume : 0.8;
        this.randomness = options.randomness !== undefined ? options.randomness : 1.0;
        this.cues = Object.assign({}, WEIGHTLESS_CUES, options.cues);
        this.voices = Object.assign({}, WEIGHTLESS_VOICES, options.voices);
        this.scale = options.scale || [
            392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51,
        ];
        this.lastPlayed = new Map();

        var self = this;
        return new Proxy(this, {
            get: function (target, prop) {
                if (prop in target) return target[prop];
                if (typeof prop === "string") {
                    return function (opts) { return self.play(prop, opts); };
                }
                return undefined;
            },
        });
    }

    Weightless.prototype.getContext = async function () {
        if (typeof window === "undefined") return null;
        if (!this.context || this.context.state === "closed") {
            var AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return null;
            this.context = new AudioContext();
        }
        if (this.context.state === "suspended") {
            await this.context.resume();
        }
        return this.context;
    };

    Weightless.prototype.ensureMasterChain = function (context) {
        if (this.masterGain && this.context === context) {
            this.masterGain.gain.setTargetAtTime(MASTER_LEVEL * this.volume, context.currentTime, 0.01);
            return this.masterGain;
        }

        var masterGain = context.createGain();
        masterGain.gain.value = MASTER_LEVEL * this.volume;

        var compressor = context.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(-20, context.currentTime);
        compressor.knee.setValueAtTime(18, context.currentTime);
        compressor.ratio.setValueAtTime(4, context.currentTime);
        compressor.attack.setValueAtTime(0.003, context.currentTime);
        compressor.release.setValueAtTime(0.08, context.currentTime);

        masterGain.connect(compressor);
        compressor.connect(context.destination);

        this.masterGain = masterGain;
        this.context = context;
        return masterGain;
    };

    Weightless.prototype.randomBetween = function (min, max) {
        return min + Math.random() * (max - min) * this.randomness;
    };

    Weightless.prototype.play = function (cueName, options) {
        if (!this.enabled) return false;

        options = options || {};
        var cue = this.cues[cueName] || this.cues.select;
        var now = Date.now();
        var lastTime = this.lastPlayed.get(cueName) || 0;

        if (now - lastTime < (cue.cooldownMs || 0) && !options.force) {
            return false;
        }

        this.lastPlayed.set(cueName, now);
        this._executePlay(cue, options);
        return true;
    };

    Weightless.prototype._executePlay = async function (cue, options) {
        var context = await this.getContext();
        if (!context) return;

        var masterNode = this.ensureMasterChain(context);
        var variants = cue.variants || [];
        var variant = variants[Math.floor(Math.random() * variants.length)] || variants[0];
        if (!variant) return;

        var self = this;
        variant.forEach(function (note) {
            self.scheduleTone(context, cue, note, masterNode, options);
        });
    };

    Weightless.prototype.scheduleTone = function (context, cue, note, masterNode, options) {
        options = options || {};
        var voice = this.voices[note.voice] || this.voices.tap;
        var delay = (note.offset || 0) + (options.delay || 0) + this.randomBetween(-0.005, 0.005);
        var startAt = context.currentTime + delay;
        var duration = note.duration || 0.05;

        var detuneRatio = centsToRatio(this.randomBetween(-(cue.detuneCents || 0), (cue.detuneCents || 0)));
        var frequency = (options.frequency || note.frequency || 440) * detuneRatio;
        var gainValue = (options.gain || note.gain || 0.02) * this.randomBetween(0.9, 1.1);

        var noteGain = context.createGain();
        var panner = context.createStereoPanner ? context.createStereoPanner() : null;

        var lastNode = noteGain;

        if (voice.lowpass) {
            var filter = context.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.setValueAtTime(voice.lowpass, startAt);
            filter.Q.setValueAtTime(0.7, startAt);
            lastNode.connect(filter);
            lastNode = filter;
        }

        if (panner) {
            panner.pan.value = this.randomBetween(-0.15, 0.15);
            lastNode.connect(panner);
            lastNode = panner;
        }

        lastNode.connect(masterNode);

        noteGain.gain.setValueAtTime(MIN_GAIN, startAt);
        noteGain.gain.exponentialRampToValueAtTime(gainValue, startAt + (voice.attack || 0.005));
        noteGain.gain.exponentialRampToValueAtTime(MIN_GAIN, startAt + duration);

        var partials = [{ ratio: 1, gain: 1, type: voice.type }].concat(voice.partials || []);

        var self = this;
        partials.forEach(function (partial) {
            var osc = context.createOscillator();
            var pGain = context.createGain();

            osc.type = partial.type || "sine";
            osc.frequency.setValueAtTime(frequency * (partial.ratio || 1), startAt);

            if (voice.bendCents) {
                osc.frequency.exponentialRampToValueAtTime(frequency * centsToRatio(voice.bendCents), startAt + duration);
            }

            pGain.gain.value = partial.gain || 1;
            osc.connect(pGain);
            pGain.connect(noteGain);

            osc.start(startAt);
            osc.stop(startAt + duration + 0.1);

            osc.onended = function () {
                osc.disconnect();
                pGain.disconnect();
            };
        });

        setTimeout(function () {
            noteGain.disconnect();
            try { lastNode.disconnect(); } catch (e) { /* ignore */ }
        }, (delay + duration + 0.2) * 1000);
    };

    Weightless.prototype.getSparkleNote = function (offset) {
        var index = Math.floor(Math.random() * this.scale.length);
        return this.scale[(index + (offset || 0) + this.scale.length) % this.scale.length];
    };

    Weightless.prototype.sequence = async function (notes, interval) {
        var context = await this.getContext();
        if (!context) return;

        var self = this;
        notes.forEach(function (note, i) {
            var freq = typeof note === 'number' ? note : note.frequency;
            self.play('select', { frequency: freq, delay: i * (interval || 0.15), force: true });
        });
    };

    Weightless.prototype.setEnabled = function (enabled) {
        this.enabled = enabled;
        if (!enabled && this.context) {
            this.context.suspend().catch(function () {});
        }
    };

    Weightless.prototype.setVolume = function (v) {
        this.volume = Math.max(0, Math.min(1, v));
        if (this.masterGain && this.context) {
            this.masterGain.gain.setTargetAtTime(MASTER_LEVEL * this.volume, this.context.currentTime, 0.01);
        }
    };

    Weightless.prototype.panic = function () {
        if (this.context) {
            this.context.close().catch(function () {});
            this.context = null;
            this.masterGain = null;
        }
    };

    window.Weightless = Weightless;
})();
