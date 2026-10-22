const CARD_VERSION = "0.1.0";

const SERVICES = {
  cover: ["cover", "open_cover", "close_cover"],
  valve: ["valve", "open_valve", "close_valve"],
};

const CIRC = 2 * Math.PI * 90;

const STYLE = `
:host { display: block; }
ha-card {
  background: linear-gradient(160deg, #0f1a2c, #070d18);
  color: #e6ebf3;
  border-radius: 26px;
  padding: 16px;
  box-shadow: 0 0 40px rgba(14,165,233,.18);
  border: 1px solid rgba(255,255,255,.07);
  overflow: hidden;
}
.head { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.ico {
  width: 44px; height: 44px; border-radius: 14px; display: grid; place-items: center;
  background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.08); color: #9aa6b8;
}
.on .ico { color: #0ea5e9; box-shadow: 0 0 14px rgba(14,165,233,.5); }
.titles { flex: 1; min-width: 0; }
.name { font-weight: 600; font-size: 16px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.eid { font: 11px 'Roboto Mono', monospace; color: #7d8aa0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pill {
  font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 999px;
  background: rgba(255,255,255,.07); color: #aab4c4; display: flex; align-items: center; gap: 6px;
}
.pill::before { content: ''; width: 7px; height: 7px; border-radius: 50%; background: #7d8aa0; }
.on .pill { color: #7dd3fc; background: rgba(14,165,233,.15); }
.on .pill::before { background: #0ea5e9; box-shadow: 0 0 6px #0ea5e9; }
.ringwrap { position: relative; width: 100%; max-width: 280px; margin: 8px auto 0; aspect-ratio: 1; }
svg { width: 100%; height: 100%; touch-action: none; overflow: visible; }
.track { fill: none; stroke: rgba(14,165,233,.35); stroke-width: 1.5; }
.arc {
  fill: none; stroke: #0ea5e9; stroke-width: 12; stroke-linecap: round;
  stroke-dasharray: ${CIRC}; transform: rotate(-90deg); transform-origin: 100px 100px;
  filter: drop-shadow(0 0 5px rgba(14,165,233,.8));
}
.knob { fill: #0ea5e9; filter: drop-shadow(0 0 6px rgba(14,165,233,.9)); cursor: grab; }
.center {
  position: absolute; inset: 0; display: flex; flex-direction: column;
  align-items: center; justify-content: center; pointer-events: none;
}
.lbl { font-size: 12px; letter-spacing: .08em; font-weight: 600; color: #8a96aa; }
.time { font: 600 44px 'Roboto Mono', monospace; line-height: 1.15; }
.sub { font-size: 13px; color: #8a96aa; }
.play {
  pointer-events: auto; margin-top: 8px; width: 44px; height: 44px; border: 0; border-radius: 50%;
  background: transparent; color: #8a96aa; cursor: pointer; display: grid; place-items: center;
}
.play:hover { color: #0ea5e9; }
.play ha-icon { --mdc-icon-size: 34px; }
.running .play { color: #0ea5e9; }
.chips { display: flex; gap: 10px; margin: 16px 0 12px; }
.chip {
  flex: 1; padding: 12px 0; border-radius: 14px; font-size: 16px; font-weight: 600; cursor: pointer;
  background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.08); color: #d5dbe6;
}
.chip.sel { border-color: #0ea5e9; background: rgba(14,165,233,.18); color: #7dd3fc; }
.chip:disabled { opacity: .4; cursor: default; }
.foot {
  display: flex; align-items: center; gap: 8px; padding-top: 12px;
  border-top: 1px solid rgba(255,255,255,.08); font: 14px 'Roboto Mono', monospace; color: #8a96aa;
}
.foot .v { color: #e6ebf3; }
.foot .pw { margin-left: auto; }
.foot ha-icon { --mdc-icon-size: 20px; }
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

class TimedSwitchCard extends HTMLElement {
  setConfig(config) {
    if (!config.entity) throw new Error("entity is required");
    this._c = { presets: [5, 15, 30, 60], max: 60, step: 1, default: 15, ...config };
    this._dur = this._c.default;
    this._built = false;
    this._end = null;
    this._total = 0;
    this._wasActive = false;
    this._setup = null;
    this._slug = `tsc_${config.entity.replace(".", "_")}`;
  }

  static getConfigElement() {
    return document.createElement("timed-switch-card-editor");
  }

  static getStubConfig(hass) {
    const e = Object.keys(hass.states).find((k) => k.startsWith("switch."));
    return { entity: e || "switch.example" };
  }

  getCardSize() {
    return 5;
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

  get _stateObj() {
    return this._hass.states[this._c.entity];
  }

  get _timerObj() {
    return this._hass.states[this._timerId] || null;
  }

  get _timerId() {
    return this._c.timer_entity || `timer.${this._slug}`;
  }

  async _ensureHelpers() {
    if (this._timerObj) return true;
    if (this._c.timer_entity || !this._hass.user?.is_admin) return false;
    if (!this._setup) {
      this._setup = this._createHelpers().then(
        () => true,
        () => false
      );
    }
    return this._setup;
  }

  async _createHelpers() {
    const h = this._hass;
    const slug = this._slug;
    const timerId = `timer.${slug}`;
    if (!h.states[timerId]) {
      await h.callWS({ type: "timer/create", name: slug, icon: "mdi:timer-outline", duration: "00:15:00" });
    }
    const exists = Object.values(h.states).some(
      (st) => st.entity_id.startsWith("automation.") && st.attributes.id === slug
    );
    if (!exists) {
      const [d, , offSvc] = this._services();
      await h.callApi("POST", `config/automation/config/${slug}`, {
        alias: `Timed Switch Card auto-off: ${this._c.entity}`,
        description: "Created by timed-switch-card. Turns the entity off when its timer finishes.",
        mode: "single",
        trigger: [{ platform: "event", event_type: "timer.finished", event_data: { entity_id: timerId } }],
        action: [{ service: `${d}.${offSvc}`, target: { entity_id: this._c.entity } }],
      });
      await h.callService("automation", "reload");
    }
  }

  _services() {
    return SERVICES[this._c.entity.split(".")[0]] || ["homeassistant", "turn_on", "turn_off"];
  }

  get _isOn() {
    const s = this._stateObj?.state;
    return s === "on" || s === "open" || s === "opening";
  }

  get _running() {
    return this._end !== null;
  }

  _storeKey() {
    return `timed-switch-card:${this._c.entity}`;
  }

  _sync() {
    const t = this._timerObj;
    if (t) {
      const active = t.state === "active";
      if (active) {
        this._end = new Date(t.attributes.finishes_at).getTime();
        const [h, m, s] = (t.attributes.duration || "0:0:0").split(":").map(Number);
        this._total = h * 3600 + m * 60 + s;
      } else {
        if (this._wasActive && this._isOn) this._power(false);
        this._end = null;
      }
      this._wasActive = active;
    } else if (this._end === null) {
      try {
        const saved = JSON.parse(localStorage.getItem(this._storeKey()));
        if (saved && saved.end > Date.now() && this._isOn) {
          this._end = saved.end;
          this._total = saved.total;
        } else if (saved) {
          localStorage.removeItem(this._storeKey());
          if (saved.end <= Date.now() && this._isOn) this._power(false);
        }
      } catch (e) {
        /* storage unavailable */
      }
    }
    if (this._end !== null && !t && !this._isOn) this._clear();

    if (this._running && !this._tick) this._tick = setInterval(() => this._onTick(), 1000);
    if (!this._running && this._tick) {
      clearInterval(this._tick);
      this._tick = null;
    }
  }

  _onTick() {
    if (this._end !== null && Date.now() >= this._end) {
      if (!this._timerObj) {
        this._power(false);
        this._clear();
      }
    }
    this._render();
  }

  _clear() {
    this._end = null;
    try {
      localStorage.removeItem(this._storeKey());
    } catch (e) {
      /* storage unavailable */
    }
  }

  _power(on) {
    const [d, onSvc, offSvc] = this._services();
    this._hass.callService(d, on ? onSvc : offSvc, { entity_id: this._c.entity });
  }

  async _toggleRun() {
    if (this._running) {
      if (this._timerObj) this._hass.callService("timer", "cancel", { entity_id: this._timerId });
      this._clear();
      this._power(false);
    } else {
      const sec = this._dur * 60;
      const useTimer = await this._ensureHelpers();
      this._power(true);
      if (useTimer) {
        this._hass.callService("timer", "start", { entity_id: this._timerId, duration: hms(sec) });
      } else {
        this._end = Date.now() + sec * 1000;
        this._total = sec;
        try {
          localStorage.setItem(this._storeKey(), JSON.stringify({ end: this._end, total: sec }));
        } catch (e) {
          /* storage unavailable */
        }
        this._tick = this._tick || setInterval(() => this._onTick(), 1000);
      }
    }
    this._render();
  }

  _build() {
    this._built = true;
    this.attachShadow({ mode: "open" });
    const chips = this._c.presets
      .map(Number)
      .filter((m) => m > 0)
      .map((m) => `<button class="chip" data-m="${m}">${m}m</button>`)
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
              <circle class="track" cx="100" cy="100" r="97"/>
              <circle class="track" cx="100" cy="100" r="83"/>
              <circle class="arc" cx="100" cy="100" r="90"/>
              <circle class="knob" r="12"/>
            </svg>
            <div class="center">
              <div class="lbl"></div>
              <div class="time"></div>
              <div class="sub"></div>
              <button class="play" aria-label="start/stop"><ha-icon></ha-icon></button>
            </div>
          </div>
          <div class="chips">${chips}</div>
          <div class="foot">
            <ha-icon icon="mdi:timer-outline"></ha-icon>
            <span>Auto-off: <span class="v auto"></span></span>
            <span class="pw"></span>
          </div>
        </div>
      </ha-card>`;
    const $ = (s) => this.shadowRoot.querySelector(s);
    this._el = {
      root: $(".root"), icon: $(".ico ha-icon"), name: $(".name"), eid: $(".eid"), pill: $(".pill"),
      arc: $(".arc"), knob: $(".knob"), lbl: $(".lbl"), time: $(".time"), sub: $(".sub"),
      playIcon: $(".play ha-icon"), auto: $(".auto"), pw: $(".pw"), svg: $("svg"),
    };
    $(".play").addEventListener("click", () => this._toggleRun());
    this.shadowRoot.querySelectorAll(".chip").forEach((b) =>
      b.addEventListener("click", () => {
        if (this._running) return;
        this._dur = Number(b.dataset.m);
        this._render();
      })
    );
    const svg = this._el.svg;
    const move = (e) => {
      if (this._running) return;
      const r = svg.getBoundingClientRect();
      let a = Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2)));
      if (a < 0) a += 2 * Math.PI;
      const { max, step } = this._c;
      let m = Math.round(((a / (2 * Math.PI)) * max) / step) * step;
      if (m <= 0) m = this._dur > max / 2 ? max : step;
      this._dur = Math.min(max, m);
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

  _render() {
    if (!this._built || !this._hass) return;
    const el = this._el;
    const st = this._stateObj;
    const running = this._running;
    const on = this._isOn;
    const remaining = running ? Math.max(0, (this._end - Date.now()) / 1000) : 0;
    const frac = running ? (this._total ? remaining / this._total : 0) : this._dur / this._c.max;
    const ang = frac * 2 * Math.PI;

    el.root.classList.toggle("on", on);
    el.root.classList.toggle("running", running);
    el.icon.setAttribute("icon", this._c.icon || st?.attributes?.icon || "mdi:sprinkler-variant");
    el.name.textContent = this._c.name || st?.attributes?.friendly_name || this._c.entity;
    el.eid.textContent = this._c.entity;
    el.pill.textContent = on ? "ON" : "OFF";
    el.arc.style.strokeDashoffset = CIRC * (1 - Math.min(frac, 0.9999));
    el.knob.setAttribute("cx", 100 + 90 * Math.sin(ang));
    el.knob.setAttribute("cy", 100 - 90 * Math.cos(ang));
    el.lbl.textContent = running ? "REMAINING" : "SET DURATION";
    el.time.textContent = running ? fmt(remaining) : fmt(this._dur * 60);
    el.sub.textContent = running ? "until auto-off" : "minutes set";
    el.playIcon.setAttribute("icon", running ? "mdi:stop" : "mdi:play");
    el.auto.textContent = fmt(running ? remaining : this._dur * 60);
    this.shadowRoot.querySelectorAll(".chip").forEach((b) => {
      b.classList.toggle("sel", Number(b.dataset.m) === this._dur);
      b.disabled = running;
    });
    const pe = this._c.power_entity && this._hass.states[this._c.power_entity];
    el.pw.textContent = pe ? `${pe.state} ${pe.attributes.unit_of_measurement || ""}` : "";
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
      this._form = document.createElement("ha-form");
      this._form.computeLabel = (s) => s.label || s.name;
      this._form.schema = [
        { name: "entity", label: "Entity", required: true, selector: { entity: {} } },
        { name: "name", label: "Name", selector: { text: {} } },
        { name: "icon", label: "Icon", selector: { icon: {} } },
        { name: "power_entity", label: "Power sensor (optional)", selector: { entity: { domain: "sensor" } } },
        { name: "timer_entity", label: "Existing timer helper (optional, auto-created if empty)", selector: { entity: { domain: "timer" } } },
        { name: "max", label: "Max minutes (ring full scale)", selector: { number: { min: 5, max: 1440, mode: "box" } } },
        { name: "default", label: "Default minutes", selector: { number: { min: 1, max: 1440, mode: "box" } } },
      ];
      this._form.addEventListener("value-changed", (e) =>
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: e.detail.value }, bubbles: true, composed: true }))
      );
      this.appendChild(this._form);
    }
    this._form.hass = this._hass;
    this._form.data = this._config;
  }
}

customElements.define("timed-switch-card", TimedSwitchCard);
customElements.define("timed-switch-card-editor", TimedSwitchCardEditor);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "timed-switch-card",
  name: "Timed Switch Card",
  description: "Turn an entity on for a selected duration, then auto-off.",
});
