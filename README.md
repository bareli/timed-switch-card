# Timed Switch Card

Lovelace card: pick a duration (drag the ring, tap a preset, or type a custom value), press play, the entity turns on and turns itself off when time ends.

**Documentation: https://bareli.github.io/timed-switch-card** ([עברית](https://bareli.github.io/timed-switch-card/he.html))

<p>
  <img src="https://raw.githubusercontent.com/bareli/timed-switch-card/master/docs/img/card-dark.png" width="230" alt="Dark theme">
  <img src="https://raw.githubusercontent.com/bareli/timed-switch-card/master/docs/img/card-running.png" width="230" alt="Running with extend buttons">
  <img src="https://raw.githubusercontent.com/bareli/timed-switch-card/master/docs/img/card-light.png" width="230" alt="Light theme">
</p>

## Install (HACS)
1. HACS > Custom repositories > add `bareli/timed-switch-card`, type **Dashboard**.
2. Install, then add resource `/hacsfiles/timed-switch-card/timed-switch-card.js` (JavaScript module) if HACS did not.

Manual: copy the JS to `/config/www/`, add resource `/local/timed-switch-card.js`.

## Zero setup, browser can be closed
Pick the entity, press play. On first start the card creates, per entity:
- a `timer` helper `timer.tsc_<domain>_<object_id>` (survives restarts, syncs all dashboards)
- an automation `tsc_<domain>_<object_id>` that runs the off action on `timer.finished`

Auto-off therefore runs on the server. Creating them needs an **admin** user once. After that, non-admin users also get server-side timers (they only start the existing timer). Until the helpers exist, non-admin users get a browser-only countdown and the card shows a warning. Delete the helper and automation in Settings to undo.

## Config
```yaml
type: custom:timed-switch-card
entity: switch.garden_lawn_sprinkler
name: Garden Sprinkler
icon: mdi:sprinkler-variant
power_entity: sensor.sprinkler_power   # shown bottom right
presets: [5, 15, 30, 60]               # minutes
max: 60                                # ring full scale
max_run: 120                           # safety cap, longest allowed run (optional)
default: 15
extend_step: 5                         # -5 / +5 / +15 buttons while running
timer_entity: timer.sprinkler          # optional, reuse your own timer (you own the automation)
notify: notify.mobile_app_phone        # optional, message when finished
```

Supports `switch`, `input_boolean`, `light`, `fan`, `cover`, `valve` and anything `homeassistant.turn_on/off` handles.

### Number entities (`number`, `input_number`)
Set a value while running, then restore:
```yaml
entity: number.pump_speed
on_value: 80          # default: entity max
off_value: previous   # default; or a fixed number such as 0
```
`previous` is stored in the browser that started the run and written into the auto-off automation at start. A non-admin user with `previous` falls back to a browser-only timer.

### Multiple zones
```yaml
type: custom:timed-switch-card
entities:
  - switch.front_lawn
  - entity: switch.back_lawn
    name: Back
    presets: [10, 20, 40]
accent_color: "#22c55e"   # shared options apply to all zones
```
Edit multi-zone cards in YAML.

### Look and behavior (all optional)
| Option | Default | Notes |
|---|---|---|
| `theme` | `auto` | `auto` follows Home Assistant light/dark, or `dark` / `light` |
| `language` | `auto` | `en` or `he` (Hebrew also switches the card to RTL) |
| `accent_color`, `text_color`, `muted_color` | | `"#22c55e"` or `[34, 197, 94]` |
| `background` | | any CSS background |
| `border_radius` | 26 | px |
| `arc_width` | 13.5 | progress bar thickness |
| `ring_size` | 280 | px, max diameter |
| `glow`, `show_rings` | true | |
| `show_header`, `show_entity_id`, `show_presets`, `show_custom`, `show_extend`, `show_footer`, `show_last_run` | true | |
| `haptics` | true | vibrate on tap (phones) |
| `sound` | false | beep in the browser when finished |
| `remember_duration` | true | last duration per entity, per browser |

## Notes and limits
- "Last ran" and remembered duration are stored per browser, not in Home Assistant.
- The finish animation, vibration and beep only fire in a browser that has the card open; `notify` is the server-side alternative.
- Extending or shortening a running timer restarts it with the new remaining time (`timer.change` cannot exceed the timer's original duration).
