const SERVICES = {
  cover: ["cover", "open_cover", "close_cover"],
  valve: ["valve", "open_valve", "close_valve"],
};
const NUMERIC = ["number", "input_number"];
const CIRC = 2 * Math.PI * 90;
const RTL = ["he", "ar", "fa", "ur"];

const STR = {
  en: {
    set: "SET DURATION", remaining: "REMAINING", minutes_set: "minutes set", until_off: "until auto-off",
    on: "ON", off: "OFF", autooff: "Auto-off:", custom: "Custom", m: "m", last_ran: "Last ran",
    warn_browser: "Browser-only timer: keep this tab open",
    warn_failed: "Server timer setup failed: auto-off only works while this tab is open",
    notify: "{name} finished",
  },
  he: {
    set: "\u05d4\u05d2\u05d3\u05e8\u05ea \u05de\u05e9\u05da", remaining: "\u05e0\u05d5\u05ea\u05e8", minutes_set: "\u05d3\u05e7\u05d5\u05ea", until_off: "\u05e2\u05d3 \u05dc\u05db\u05d9\u05d1\u05d5\u05d9",
    on: "\u05e4\u05e2\u05d9\u05dc", off: "\u05db\u05d1\u05d5\u05d9", autooff: "\u05db\u05d9\u05d1\u05d5\u05d9 \u05d0\u05d5\u05d8\u05d5\u05de\u05d8\u05d9:", custom: "\u05de\u05d5\u05ea\u05d0\u05dd", m: " \u05d3'", last_ran: "\u05d4\u05d5\u05e4\u05e2\u05dc \u05dc\u05d0\u05d7\u05e8\u05d5\u05e0\u05d4",
    warn_browser: "\u05d8\u05d9\u05d9\u05de\u05e8 \u05d1\u05d3\u05e4\u05d3\u05e4\u05df \u05d1\u05dc\u05d1\u05d3: \u05d4\u05e9\u05d0\u05e8 \u05d0\u05ea \u05d4\u05dc\u05e9\u05d5\u05e0\u05d9\u05ea \u05e4\u05ea\u05d5\u05d7\u05d4",
    warn_failed: "\u05d4\u05d2\u05d3\u05e8\u05ea \u05d8\u05d9\u05d9\u05de\u05e8 \u05d1\u05e9\u05e8\u05ea \u05e0\u05db\u05e9\u05dc\u05d4: \u05db\u05d9\u05d1\u05d5\u05d9 \u05d0\u05d5\u05d8\u05d5\u05de\u05d8\u05d9 \u05e8\u05e7 \u05db\u05e9\u05d4\u05dc\u05e9\u05d5\u05e0\u05d9\u05ea \u05e4\u05ea\u05d5\u05d7\u05d4",
    notify: "{name} \u05d4\u05e1\u05ea\u05d9\u05d9\u05dd",
  },
};

const STYLE = `
:host { display: block; }
ha-card {
  display: block;
  --t0: #e6ebf3; --m0: #8a96aa;
  --s: rgba(255,255,255,.06); --b: rgba(255,255,255,.08);
  --bg0: linear-gradient(160deg, #0f1a2c, #070d18);
  --a: var(--tsc-accent, #0ea5e9);
  --a-soft: color-mix(in srgb, var(--a) 18%, transparent);
  --a-ring: color-mix(in srgb, var(--a) 40%, transparent);
  --a-light: color-mix(in srgb, var(--a) 55%, white);
  --t: var(--tsc-text, var(--t0));
  --m: var(--tsc-muted, var(--m0));
  background: var(--tsc-bg, var(--bg0));
  color: var(--t);
  border-radius: var(--tsc-radius, 26px);
  padding: 16px;
  box-shadow: 0 0 40px color-mix(in srgb, var(--a) 18%, transparent);
  border: 1px solid var(--b);
  overflow: hidden;
}
ha-card.light {
  --t0: #1b2433; --m0: #5f6b7e;
  --s: rgba(0,0,0,.05); --b: rgba(0,0,0,.1);
  --bg0: linear-gradient(160deg, #ffffff, #eaf0f8);
  --a-light: color-mix(in srgb, var(--a) 70%, black);
  box-shadow: 0 2px 16px rgba(0,0,0,.08);
}
ha-card.noglow { box-shadow: none; }
.head { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.ico {
  width: 44px; height: 44px; border-radius: 14px; display: grid; place-items: center;
  background: var(--s); border: 1px solid var(--b); color: var(--m);
}
.on .ico { color: var(--a); box-shadow: 0 0 14px color-mix(in srgb, var(--a) 50%, transparent); }
.noglow .on .ico { box-shadow: none; }
.titles { flex: 1; min-width: 0; }
.name { font-weight: 600; font-size: 16px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.eid { font: 11px 'Roboto Mono', monospace; color: var(--m); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; direction: ltr; text-align: start; }
.pill {
  font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 999px;
  background: var(--s); color: var(--m); display: flex; align-items: center; gap: 6px;
}
.pill::before { content: ''; width: 7px; height: 7px; border-radius: 50%; background: var(--m); }
.on .pill { color: var(--a-light); background: var(--a-soft); }
.on .pill::before { background: var(--a); box-shadow: 0 0 6px var(--a); }
.noglow .on .pill::before { box-shadow: none; }
.ringwrap { position: relative; width: 100%; max-width: var(--tsc-ring-size, 280px); margin: 8px auto 0; aspect-ratio: 1; }
svg { width: 100%; height: 100%; touch-action: none; overflow: visible; }
.track { fill: none; stroke: var(--a-ring); stroke-width: 1.5; }
.norings .track { display: none; }
.arc {
  fill: none; stroke: var(--a); stroke-width: var(--tsc-arc-width, 13.5); stroke-linecap: round;
  stroke-dasharray: ${CIRC}; transform: rotate(-90deg); transform-origin: 100px 100px;
  filter: drop-shadow(0 0 5px color-mix(in srgb, var(--a) 80%, transparent));
}
.noglow .arc, .noglow .knob { filter: none; }
.knob { fill: var(--a); filter: drop-shadow(0 0 6px color-mix(in srgb, var(--a) 90%, transparent)); cursor: grab; }
.done .arc, .done .knob { animation: tscpulse .7s ease-in-out 5; }
@keyframes tscpulse { 0%, 100% { opacity: 1; } 50% { opacity: .25; } }
.center {
  position: absolute; inset: 0; display: flex; flex-direction: column;
  align-items: center; justify-content: center; pointer-events: none;
}
.lbl { font-size: 12px; letter-spacing: .08em; font-weight: 600; color: var(--m); }
.time { font: 600 44px 'Roboto Mono', monospace; line-height: 1.15; direction: ltr; }
.sub { font-size: 13px; color: var(--m); }
.play {
  pointer-events: auto; margin-top: 8px; width: 44px; height: 44px; border: 0; border-radius: 50%;
  background: transparent; color: var(--m); cursor: pointer; display: grid; place-items: center;
  transition: transform .1s;
}
.play:active { transform: scale(.88); }
.play:hover { color: var(--a); }
.play ha-icon { --mdc-icon-size: 34px; }
.running .play { color: var(--a); }
.chips { display: flex; gap: 10px; margin: 16px 0 12px; }
.chip {
  flex: 1; min-width: 0; padding: 12px 0; border-radius: 14px; font-weight: 600; font-size: 16px; font-family: inherit; cursor: pointer;
  background: var(--s); border: 1px solid var(--b); color: var(--t); transition: transform .1s;
}
.chip:active:not(:disabled) { transform: scale(.94); }
.chip.sel { border-color: var(--a); background: var(--a-soft); color: var(--a-light); }
.chip:disabled { opacity: .4; cursor: default; }
.chip.custom { flex: 1.3; font-size: 14px; }
.cinput { text-align: center; outline: none; border-color: var(--a); width: 100%; box-sizing: border-box; }
.warn {
  display: flex; align-items: center; gap: 8px; margin: 0 0 12px; padding: 8px 10px; border-radius: 10px;
  font-size: 12px; background: rgba(245,158,11,.15); color: #f59e0b;
}
.warn ha-icon { --mdc-icon-size: 18px; flex: none; }
.foot {
  display: flex; align-items: center; gap: 8px; padding-top: 12px; margin-top: 12px;
  border-top: 1px solid var(--b); font: 14px 'Roboto Mono', monospace; color: var(--m);
}
.chips + .foot, .warn + .foot { margin-top: 0; }
.foot .v { color: var(--t); direction: ltr; display: inline-block; }
.foot .pw { margin-inline-start: auto; direction: ltr; }
.foot ha-icon { --mdc-icon-size: 20px; }
.last { font-size: 12px; color: var(--m); padding-top: 6px; }
[hidden] { display: none !important; }
`;

const fmt = (sec) => {
  sec = Math.max(0, Math.round(sec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const p = (n) => String(n).padStart(2, "0");
  return h ? `${h}:${p(m)}:${p(s)}` : `${p(m)}:${p(s)}`;
};

const hms = (sec) => {
  const p = (n) => String(n).padStart(2, "0");
  return `${p(Math.floor(sec / 3600))}:${p(Math.floor((sec % 3600) / 60))}:${p(sec % 60)}`;
};

const toColor = (v) => (Array.isArray(v) ? `rgb(${v[0]},${v[1]},${v[2]})` : v);

const store = {
  get(k) {
    try {
      return JSON.parse(localStorage.getItem(k));
    } catch (e) {
      return null;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch (e) {
      /* storage unavailable */
    }
  },
  del(k) {
    try {
      localStorage.removeItem(k);
    } catch (e) {
      /* storage unavailable */
    }
  },
};

class TimedSwitchZone extends HTMLElement {
  setConfig(config) {
    if (!config.entity) throw new Error("entity is required");
    this._c = { presets: [5, 15, 30, 60], max: 60, step: 1, default: 15, arc_width: 13.5, extend_step: 5, ...config };
    this._built = false;
    this._end = null;
    this._total = 0;
    this._wasActive = false;
    this._lastEnd = 0;
    this._useTimer = false;
    this._autoSig = null;
    this._warn = null;
    this._prev = null;
    this._editing = false;
    this._slug = `tsc_${config.entity.replace(".", "_")}`;
    const saved = this._c.remember_duration === false ? null : store.get(this._key("dur"));
    this._dur = Math.min(this._cap, Math.max(1, Number(saved) || this._c.default));
    const p = store.get(this._key("prev"));
    if (typeof p === "number") this._prev = p;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._built) this._build();
    this._sync();
    this._render();
  }

  disconnectedCallback() {
    clearInterval(this._tick);
    this._tick = null;
  }

  _key(kind) {
    return kind === "run" ? `timed-switch-card:${this._c.entity}` : `timed-switch-card:${kind}:${this._c.entity}`;
  }

  get _cap() {
    return Number(this._c.max_run) > 0 ? Number(this._c.max_run) : 1440;
  }

  get _ringMax() {
    return Math.min(Number(this._c.max) || 60, this._cap);
  }

  get _domain() {
    return this._c.entity.split(".")[0];
  }

  get _numeric() {
    return NUMERIC.includes(this._domain);
  }

  get _stateObj() {
    return this._hass.states[this._c.entity];
  }

  get _timerId() {
    return this._c.timer_entity || `timer.${this._slug}`;
  }

  get _timerObj() {
    return this._hass.states[this._timerId] || null;
  }

  get _running() {
    return this._end !== null;
  }

  get _onValue() {
    const a = this._stateObj?.attributes || {};
    return Number(this._c.on_value ?? a.max ?? 100);
  }

  get _offValue() {
    const o = this._c.off_value;
    if (o !== undefined && o !== null && o !== "" && o !== "previous" && !Number.isNaN(Number(o))) return Number(o);
    return this._prev ?? Number(this._stateObj?.attributes?.min ?? 0);
  }

  get _isOn() {
    const st = this._stateObj;
    if (this._numeric) return this._running || Number(st?.state) === this._onValue;
    const s = st?.state;
    return s === "on" || s === "open" || s === "opening";
  }

  get _lang() {
    return (this._c.language && this._c.language !== "auto" ? this._c.language : this._hass?.locale?.language || this._hass?.language || "en").toLowerCase();
  }

  get _t() {
    return STR[this._lang.split("-")[0]] || STR.en;
  }

  get _isLight() {
    const th = this._c.theme;
    if (th === "light") return true;
    if (th === "dark") return false;
    return this._hass?.themes?.darkMode === false;
  }

  _inTimerMode() {
    const t = this._timerObj;
    return !!t && (this._useTimer || t.state === "active");
  }

  _services() {
    return SERVICES[this._domain] || ["homeassistant", "turn_on", "turn_off"];
  }

  _action(on) {
    if (this._numeric) {
      return { domain: this._domain, service: "set_value", data: { entity_id: this._c.entity, value: on ? this._onValue : this._offValue } };
    }
    const [d, onSvc, offSvc] = this._services();
    return { domain: d, service: on ? onSvc : offSvc, data: { entity_id: this._c.entity } };
  }

  _power(on) {
    const a = this._action(on);
    this._hass.callService(a.domain, a.service, a.data);
  }

  _buzz(ms = 15) {
    if (this._c.haptics !== false && navigator.vibrate) navigator.vibrate(ms);
  }

  _setDur(m) {
    this._dur = Math.min(this._cap, Math.max(1, Math.round(m)));
    if (this._c.remember_duration !== false) store.set(this._key("dur"), this._dur);
  }

  _persist() {
    store.set(this._key("run"), { end: this._end, total: this._total, prev: this._prev });
  }

  _clear() {
    this._end = null;
    store.del(this._key("run"));
  }

  _sync() {
    const t = this._timerObj;
    const timerMode = this._inTimerMode();
    if (timerMode) {
      const active = t.state === "active";
      if (active) {
        this._end = new Date(t.attributes.finishes_at).getTime();
        const [h, m, s] = (t.attributes.duration || "0:0:0").split(":").map(Number);
        this._total = h * 3600 + m * 60 + s;
        this._lastEnd = this._end;
      } else {
        if (this._wasActive) {
          if (Date.now() >= this._lastEnd - 3000) this._markDone();
          if (this._isOn) this._power(false);
        }
        this._end = null;
        this._useTimer = false;
      }
      this._wasActive = active;
    } else if (this._end === null) {
      const saved = store.get(this._key("run"));
      if (saved) {
        if (saved.end > Date.now() && this._isOn) {
          this._end = saved.end;
          this._total = saved.total;
          if (typeof saved.prev === "number") this._prev = saved.prev;
        } else {
          store.del(this._key("run"));
          if (saved.end <= Date.now() && this._isOn) this._power(false);
        }
      }
    }
    if (this._end !== null && !timerMode && !this._isOn) this._clear();

    if (this._running && !this._tick) this._tick = setInterval(() => this._onTick(), 1000);
    if (!this._running && this._tick) {
      clearInterval(this._tick);
      this._tick = null;
    }
  }

  _onTick() {
    if (this._end !== null && Date.now() >= this._end && !this._inTimerMode()) {
      this._power(false);
      this._clear();
      this._markDone();
      this._notifyLocal();
    }
    this._render();
  }

  _markDone() {
    this._done = true;
    clearTimeout(this._doneTimer);
    this._doneTimer = setTimeout(() => {
      this._done = false;
      this._render();
    }, 4000);
    this._buzz([200, 100, 200]);
    if (this._c.sound) {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const o = ctx.createOscillator();
        o.frequency.value = 880;
        o.connect(ctx.destination);
        o.start();
        o.stop(ctx.currentTime + 0.35);
      } catch (e) {
        /* audio unavailable */
      }
    }
  }

  get _notifyService() {
    const n = this._c.notify;
    return typeof n === "string" && /^[a-z_]+\.[a-z0-9_]+$/.test(n) ? n : null;
  }

  get _displayName() {
    return this._c.name || this._stateObj?.attributes?.friendly_name || this._c.entity;
  }

  _notifyMsg() {
    return this._t.notify.replace("{name}", this._displayName);
  }

  _notifyLocal() {
    const n = this._notifyService;
    if (n) {
      const [d, s] = n.split(".");
      this._hass.callService(d, s, { message: this._notifyMsg() });
    }
  }

  _autoExists() {
    return Object.values(this._hass.states).some(
      (st) => st.entity_id.startsWith("automation.") && st.attributes.id === this._slug
    );
  }

  async _ensureHelpers() {
    const h = this._hass;
    if (this._c.timer_entity) return !!this._timerObj;
    const fixedOff = !this._numeric || String(this._c.off_value ?? "previous") !== "previous";
    if (!h.user?.is_admin) {
      if (this._timerObj && this._autoExists() && fixedOff && !this._notifyService) {
        this._warn = null;
        return true;
      }
      this._warn = "warn_browser";
      return false;
    }
    try {
      if (!this._timerObj) {
        await h.callWS({ type: "timer/create", name: this._slug, icon: "mdi:timer-outline", duration: "00:15:00" });
      }
      await this._syncAutomation();
      this._warn = null;
      return true;
    } catch (e) {
      this._warn = "warn_failed";
      return false;
    }
  }

  async _syncAutomation() {
    const h = this._hass;
    const off = this._action(false);
    const offAct = { service: `${off.domain}.${off.service}`, target: { entity_id: this._c.entity } };
    if (this._numeric) offAct.data = { value: off.data.value };
    const action = [offAct];
    if (this._notifyService) action.push({ service: this._notifyService, data: { message: this._notifyMsg() } });
    const desired = {
      alias: `Timed Switch Card auto-off: ${this._c.entity}`,
      description: "Created by timed-switch-card. Runs when the entity timer finishes.",
      mode: "single",
      trigger: [{ platform: "event", event_type: "timer.finished", event_data: { entity_id: `timer.${this._slug}` } }],
      action,
    };
    const norm = (o) => JSON.stringify({ alias: o.alias, mode: o.mode, trigger: o.trigger, action: o.action });
    const sig = norm(desired);
    if (this._autoSig === sig && this._autoExists()) return;
    let existing = null;
    try {
      existing = await h.callApi("GET", `config/automation/config/${this._slug}`);
    } catch (e) {
      existing = null;
    }
    if (!existing || norm(existing) !== sig) {
      await h.callApi("POST", `config/automation/config/${this._slug}`, desired);
      await h.callService("automation", "reload");
    }
    this._autoSig = sig;
  }

  async _toggleRun() {
    if (this._busy) return;
    this._busy = true;
    try {
      this._buzz();
      if (this._running) {
        if (this._inTimerMode()) this._hass.callService("timer", "cancel", { entity_id: this._timerId });
        this._wasActive = false;
        this._clear();
        this._useTimer = false;
        this._power(false);
      } else {
        const sec = this._dur * 60;
        if (this._numeric) {
          const cur = Number(this._stateObj?.state);
          this._prev = cur === this._onValue || Number.isNaN(cur) ? Number(this._stateObj?.attributes?.min ?? 0) : cur;
          store.set(this._key("prev"), this._prev);
        }
        const useTimer = await this._ensureHelpers();
        this._power(true);
        store.set(this._key("last"), { ts: Date.now(), min: this._dur });
        if (useTimer) {
          this._useTimer = true;
          this._hass.callService("timer", "start", { entity_id: this._timerId, duration: hms(sec) });
        } else {
          this._end = Date.now() + sec * 1000;
          this._total = sec;
          this._persist();
          this._tick = this._tick || setInterval(() => this._onTick(), 1000);
        }
      }
    } finally {
      this._busy = false;
    }
    this._render();
  }

  _extend(delta) {
    if (!this._running) return;
    const rem = (this._end - Date.now()) / 1000;
    let d = delta * 60;
    if (d > 0) d = Math.min(d, this._cap * 60 - rem);
    if (d === 0 || (d < 0 && rem + d < 30) || (d > 0 && d < 1)) return;
    d = Math.round(d);
    this._buzz();
    if (this._inTimerMode()) {
      this._hass.callService("timer", "change", {
        entity_id: this._timerId,
        duration: `${d < 0 ? "-" : ""}${hms(Math.abs(d))}`,
      });
    } else {
      this._total += d;
      this._persist();
    }
    this._end += d * 1000;
    this._render();
  }

  _build() {
    this._built = true;
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    const t = this._t;
    const presets = this._c.presets.map(Number).filter((m) => m > 0 && m <= this._cap);
    const chips = presets.map((m) => `<button class="chip" data-m="${m}">${m}${t.m}</button>`).join("");
    const ext = Number(this._c.extend_step) || 5;
    const adj = [-ext, ext, ext * 3]
      .map((d) => `<button class="chip adj" data-d="${d}">${d > 0 ? "+" : "-"}${Math.abs(d)}${t.m}</button>`)
      .join("");
    this.shadowRoot.innerHTML = `
      <style>${STYLE}</style>
      <ha-card>
        <div class="root">
          <div class="head">
            <div class="ico"><ha-icon></ha-icon></div>
            <div class="titles"><div class="name"></div><div class="eid"></div></div>
            <div class="pill"></div>
          </div>
          <div class="ringwrap">
            <svg viewBox="0 0 200 200">
              <circle class="track" cx="100" cy="100" r="96"/>
              <circle class="track" cx="100" cy="100" r="84"/>
              <circle class="arc" cx="100" cy="100" r="90"/>
              <circle class="knob" r="11"/>
            </svg>
            <div class="center">
              <div class="lbl"></div>
              <div class="time"></div>
              <div class="sub"></div>
              <button class="play" aria-label="start/stop"><ha-icon></ha-icon></button>
            </div>
          </div>
          <div class="chips presets">${chips}<button class="chip custom"></button><input class="chip cinput" type="number" min="1" max="${this._cap}" step="1" inputmode="numeric" hidden></div>
          <div class="chips adjust" hidden>${adj}</div>
          <div class="warn" hidden><ha-icon icon="mdi:alert-outline"></ha-icon><span></span></div>
          <div class="foot">
            <ha-icon icon="mdi:timer-outline"></ha-icon>
            <span><span class="al"></span> <span class="v auto"></span></span>
            <span class="pw"></span>
          </div>
          <div class="last" hidden></div>
        </div>
      </ha-card>`;
    const $ = (s) => this.shadowRoot.querySelector(s);
    this._el = {
      card: $("ha-card"), root: $(".root"), icon: $(".ico ha-icon"), name: $(".name"), eid: $(".eid"), pill: $(".pill"),
      arc: $(".arc"), knob: $(".knob"), lbl: $(".lbl"), time: $(".time"), sub: $(".sub"),
      playIcon: $(".play ha-icon"), auto: $(".auto"), al: $(".al"), pw: $(".pw"), svg: $("svg"),
      head: $(".head"), presets: $(".presets"), adjust: $(".adjust"), foot: $(".foot"), last: $(".last"),
      warn: $(".warn"), warnText: $(".warn span"), custom: $(".custom"), cinput: $(".cinput"),
    };
    this._applyStyle();
    $(".play").addEventListener("click", () => this._toggleRun());
    this.shadowRoot.querySelectorAll(".presets .chip[data-m]").forEach((b) =>
      b.addEventListener("click", () => {
        if (this._running) return;
        this._buzz(8);
        this._setDur(Number(b.dataset.m));
        this._render();
      })
    );
    this.shadowRoot.querySelectorAll(".adj").forEach((b) => b.addEventListener("click", () => this._extend(Number(b.dataset.d))));

    const { custom, cinput } = this._el;
    const closeInput = (apply) => {
      if (!this._editing) return;
      this._editing = false;
      const v = Number(cinput.value);
      if (apply && v > 0) this._setDur(v);
      cinput.hidden = true;
      custom.hidden = this._c.show_custom === false;
      this._render();
    };
    custom.addEventListener("click", () => {
      if (this._running) return;
      this._editing = true;
      custom.hidden = true;
      cinput.hidden = false;
      cinput.value = this._dur;
      cinput.focus();
      cinput.select();
    });
    cinput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") closeInput(true);
      if (e.key === "Escape") closeInput(false);
    });
    cinput.addEventListener("blur", () => closeInput(true));

    const svg = this._el.svg;
    const move = (e) => {
      if (this._running) return;
      const r = svg.getBoundingClientRect();
      let a = Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2)));
      if (a < 0) a += 2 * Math.PI;
      const max = this._ringMax;
      const step = Number(this._c.step) || 1;
      let m = Math.round(((a / (2 * Math.PI)) * max) / step) * step;
      if (m <= 0) m = this._dur > max / 2 ? max : step;
      this._setDur(Math.min(max, m));
      this._render();
    };
    svg.addEventListener("pointerdown", (e) => {
      if (this._running) return;
      svg.setPointerCapture(e.pointerId);
      this._drag = true;
      move(e);
    });
    svg.addEventListener("pointermove", (e) => this._drag && move(e));
    svg.addEventListener("pointerup", () => (this._drag = false));
    svg.addEventListener("pointercancel", () => (this._drag = false));
  }

  _applyStyle() {
    const c = this._c;
    const card = this._el.card;
    const set = (k, v) => (v === undefined || v === null || v === "" ? card.style.removeProperty(k) : card.style.setProperty(k, v));
    set("--tsc-accent", toColor(c.accent_color));
    set("--tsc-text", toColor(c.text_color));
    set("--tsc-muted", toColor(c.muted_color));
    set("--tsc-bg", c.background);
    set("--tsc-radius", c.border_radius != null ? `${Number(c.border_radius)}px` : null);
    set("--tsc-arc-width", Number(c.arc_width) || 13.5);
    set("--tsc-ring-size", c.ring_size != null ? `${Number(c.ring_size)}px` : null);
    card.classList.toggle("noglow", c.glow === false);
    card.classList.toggle("norings", c.show_rings === false);
    this._el.knob.setAttribute("r", Math.max(6, (Number(c.arc_width) || 13.5) * 0.8));
    this._el.head.hidden = c.show_header === false;
    this._el.eid.hidden = c.show_entity_id === false;
    this._el.foot.hidden = c.show_footer === false;
    this._el.custom.hidden = c.show_custom === false;
  }

  _lastRan() {
    if (this._c.show_last_run === false || this._c.show_footer === false || this._running || this._isOn) return "";
    const r = store.get(this._key("last"));
    if (!r) return "";
    const s = (r.ts + r.min * 60000 - Date.now()) / 1000;
    const a = Math.abs(s);
    let rel;
    try {
      const rtf = new Intl.RelativeTimeFormat(this._lang, { numeric: "auto" });
      if (a < 60) rel = rtf.format(0, "second");
      else if (a < 3600) rel = rtf.format(Math.round(s / 60), "minute");
      else if (a < 86400) rel = rtf.format(Math.round(s / 3600), "hour");
      else rel = rtf.format(Math.round(s / 86400), "day");
    } catch (e) {
      return "";
    }
    return `${this._t.last_ran}: ${rel} \u00b7 ${r.min}${this._t.m}`;
  }

  _render() {
    if (!this._built || !this._hass) return;
    const el = this._el;
    const t = this._t;
    const st = this._stateObj;
    const running = this._running;
    const on = this._isOn;
    const remaining = running ? Math.max(0, (this._end - Date.now()) / 1000) : 0;
    const total = Math.max(this._total, remaining);
    const frac = running ? (total ? remaining / total : 0) : Math.min(1, this._dur / this._ringMax);
    const ang = frac * 2 * Math.PI;

    el.card.dir = RTL.includes(this._lang.split("-")[0]) ? "rtl" : "ltr";
    el.card.classList.toggle("light", this._isLight);
    el.root.classList.toggle("on", on);
    el.root.classList.toggle("running", running);
    el.root.classList.toggle("done", !!this._done);
    el.icon.setAttribute("icon", this._c.icon || st?.attributes?.icon || "mdi:sprinkler-variant");
    el.name.textContent = this._displayName;
    el.eid.textContent = this._c.entity;
    el.pill.textContent = on ? t.on : t.off;
    el.arc.style.strokeDashoffset = CIRC * (1 - Math.min(frac, 0.9999));
    el.knob.setAttribute("cx", 100 + 90 * Math.sin(ang));
    el.knob.setAttribute("cy", 100 - 90 * Math.cos(ang));
    el.lbl.textContent = running ? t.remaining : t.set;
    el.time.textContent = running ? fmt(remaining) : fmt(this._dur * 60);
    el.sub.textContent = running ? t.until_off : t.minutes_set;
    el.playIcon.setAttribute("icon", running ? "mdi:stop" : "mdi:play");
    el.al.textContent = t.autooff;
    el.auto.textContent = fmt(running ? remaining : this._dur * 60);

    const showPresets = this._c.show_presets !== false;
    el.presets.hidden = running || !showPresets;
    el.adjust.hidden = !running || this._c.show_extend === false;
    const presetVals = [...this.shadowRoot.querySelectorAll(".presets .chip[data-m]")].map((b) => Number(b.dataset.m));
    this.shadowRoot.querySelectorAll(".presets .chip[data-m]").forEach((b) => b.classList.toggle("sel", Number(b.dataset.m) === this._dur));
    const customSel = !presetVals.includes(this._dur);
    el.custom.classList.toggle("sel", customSel);
    el.custom.textContent = customSel ? `${this._dur}${t.m}` : t.custom;
    const ext = Number(this._c.extend_step) || 5;
    this.shadowRoot.querySelectorAll(".adj").forEach((b) => {
      const d = Number(b.dataset.d);
      b.disabled = d < 0 ? remaining < Math.abs(d) * 60 + 30 : remaining >= this._cap * 60 - 1 || ext <= 0;
    });

    const warnKey = this._warn || (running && !this._inTimerMode() ? "warn_browser" : null);
    el.warn.hidden = !warnKey;
    if (warnKey) el.warnText.textContent = t[warnKey];

    const pe = this._c.power_entity && this._hass.states[this._c.power_entity];
    el.pw.textContent = pe ? `${pe.state} ${pe.attributes.unit_of_measurement || ""}` : "";
    const last = this._lastRan();
    el.last.hidden = !last;
    el.last.textContent = last;
  }
}

class TimedSwitchCard extends HTMLElement {
  setConfig(config) {
    const zones = Array.isArray(config.entities) && config.entities.length ? config.entities : null;
    if (!config.entity && !zones) throw new Error("entity or entities is required");
    this._cfg = config;
    this._zones = zones ? zones.map((z) => (typeof z === "string" ? { entity: z } : z)) : null;
    this._idx = Math.min(this._idx || 0, (this._zones ? this._zones.length : 1) - 1);
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .tabs { display: flex; gap: 8px; overflow-x: auto; margin-bottom: 8px; padding: 2px; }
        .tab {
          flex: 0 0 auto; padding: 6px 14px; border-radius: 999px; cursor: pointer; font-weight: 600; font-size: 13px; font-family: inherit;
          border: 1px solid rgba(127,127,127,.35); background: rgba(127,127,127,.12);
          color: var(--primary-text-color, #e6ebf3);
        }
        .tab.sel { border-color: var(--a); background: color-mix(in srgb, var(--a) 22%, transparent); }
      </style>
      <div class="tabs" hidden></div>`;
    this.shadowRoot.host.style.setProperty("--a", toColor(config.accent_color) || "#0ea5e9");
    this._zone = document.createElement("timed-switch-zone");
    this.shadowRoot.appendChild(this._zone);
    this._labels = "";
    this._applyZone();
  }

  static getConfigElement() {
    return document.createElement("timed-switch-card-editor");
  }

  static getStubConfig(hass) {
    const e = Object.keys(hass.states).find((k) => k.startsWith("switch."));
    return { entity: e || "switch.example" };
  }

  getCardSize() {
    return this._zones ? 6 : 5;
  }

  set hass(hass) {
    this._hass = hass;
    this._drawTabs();
    this._zone.hass = hass;
  }

  _applyZone() {
    const { entities, ...rest } = this._cfg;
    const z = this._zones ? this._zones[this._idx] : {};
    this._zone.setConfig({ ...rest, ...z });
    if (this._hass) this._zone.hass = this._hass;
  }

  _drawTabs() {
    const box = this.shadowRoot.querySelector(".tabs");
    if (!this._zones || this._zones.length < 2) {
      box.hidden = true;
      return;
    }
    const names = this._zones.map((z) => z.name || this._hass.states[z.entity]?.attributes?.friendly_name || z.entity);
    const sig = names.join("|") + this._idx;
    if (sig === this._labels) return;
    this._labels = sig;
    box.hidden = false;
    box.replaceChildren(
      ...names.map((n, i) => {
        const b = document.createElement("button");
        b.className = `tab${i === this._idx ? " sel" : ""}`;
        b.textContent = n;
        b.addEventListener("click", () => {
          this._idx = i;
          this._labels = "";
          this._applyZone();
          this._drawTabs();
        });
        return b;
      })
    );
  }
}

class TimedSwitchCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
    this._draw();
  }

  set hass(hass) {
    this._hass = hass;
    this._draw();
  }

  _draw() {
    if (!this._hass || !this._config) return;
    if (!this._form) {
      const sel = (options) => ({ select: { mode: "dropdown", options } });
      const bool = (name, label) => ({ name, label, selector: { boolean: {} } });
      this._form = document.createElement("ha-form");
      this._form.computeLabel = (s) => s.label || s.name;
      this._form.schema = [
        { name: "entity", label: "Entity (multi-zone: use YAML `entities`)", selector: { entity: {} } },
        { name: "name", label: "Name", selector: { text: {} } },
        { name: "icon", label: "Icon", selector: { icon: {} } },
        { name: "power_entity", label: "Power sensor (optional)", selector: { entity: { domain: "sensor" } } },
        { name: "timer_entity", label: "Existing timer helper (optional, auto-created if empty)", selector: { entity: { domain: "timer" } } },
        { name: "max", label: "Max minutes (ring full scale)", selector: { number: { min: 5, max: 1440, mode: "box" } } },
        { name: "max_run", label: "Safety cap: longest allowed run (minutes, optional)", selector: { number: { min: 1, max: 1440, mode: "box" } } },
        { name: "default", label: "Default minutes", selector: { number: { min: 1, max: 1440, mode: "box" } } },
        { name: "extend_step", label: "Extend button step (minutes)", selector: { number: { min: 1, max: 120, mode: "box" } } },
        { name: "on_value", label: "Number entities: value while running", selector: { number: { mode: "box" } } },
        { name: "off_value", label: "Number entities: value after (number or 'previous')", selector: { text: {} } },
        { name: "notify", label: "Notify service when done (e.g. notify.mobile_app_phone)", selector: { text: {} } },
        bool("sound", "Beep when finished (browser)"),
        bool("haptics", "Vibrate on tap (phones)"),
        bool("remember_duration", "Remember last duration"),
        { name: "theme", label: "Theme", selector: sel([{ value: "auto", label: "Auto (follow Home Assistant)" }, { value: "dark", label: "Dark" }, { value: "light", label: "Light" }]) },
        { name: "language", label: "Language", selector: sel([{ value: "auto", label: "Auto" }, { value: "en", label: "English" }, { value: "he", label: "\u05e2\u05d1\u05e8\u05d9\u05ea" }]) },
        { name: "accent_color", label: "Accent color", selector: { color_rgb: {} } },
        { name: "text_color", label: "Text color", selector: { color_rgb: {} } },
        { name: "muted_color", label: "Secondary text color", selector: { color_rgb: {} } },
        { name: "background", label: "Background (any CSS, e.g. #101820 or a gradient)", selector: { text: {} } },
        { name: "border_radius", label: "Corner radius (px)", selector: { number: { min: 0, max: 60, mode: "slider" } } },
        { name: "arc_width", label: "Progress bar thickness", selector: { number: { min: 3, max: 20, step: 0.5, mode: "slider" } } },
        { name: "ring_size", label: "Ring size (px, max)", selector: { number: { min: 140, max: 500, mode: "slider" } } },
        bool("glow", "Glow"),
        bool("show_rings", "Show thin ring lines"),
        bool("show_header", "Show header"),
        bool("show_entity_id", "Show entity id"),
        bool("show_presets", "Show preset buttons"),
        bool("show_custom", "Show custom duration button"),
        bool("show_extend", "Show extend buttons while running"),
        bool("show_footer", "Show footer"),
        bool("show_last_run", "Show last run"),
      ];
      this._form.addEventListener("value-changed", (e) =>
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: e.detail.value }, bubbles: true, composed: true }))
      );
      this.appendChild(this._form);
    }
    this._form.hass = this._hass;
    this._form.data = {
      glow: true, show_rings: true, show_header: true, show_entity_id: true, show_presets: true, show_custom: true,
      show_extend: true, show_footer: true, show_last_run: true, haptics: true, remember_duration: true,
      theme: "auto", language: "auto",
      ...this._config,
    };
  }
}

customElements.define("timed-switch-zone", TimedSwitchZone);
customElements.define("timed-switch-card", TimedSwitchCard);
customElements.define("timed-switch-card-editor", TimedSwitchCardEditor);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "timed-switch-card",
  name: "Timed Switch Card",
  description: "Turn an entity on for a selected duration, then auto-off.",
});
