# Timed Switch Card

Lovelace card: pick a duration (drag ring or tap preset), press play, entity turns on and auto-offs when time ends.

## Install (HACS)
1. Push this folder as its own GitHub repo (root must contain `timed-switch-card.js` and `hacs.json`).
2. HACS > Custom repositories > add repo, type **Dashboard**.
3. Install, then add resource `/hacsfiles/timed-switch-card/timed-switch-card.js` (type: JavaScript module) if HACS did not.

Manual: copy JS to `/config/www/`, add resource `/local/timed-switch-card.js`.

## Config
```yaml
type: custom:timed-switch-card
entity: switch.garden_lawn_sprinkler
name: Garden Sprinkler        # optional
icon: mdi:sprinkler-variant   # optional
power_entity: sensor.sprinkler_power  # optional, shown bottom right
presets: [5, 15, 30, 60]      # minutes
max: 60                       # ring full scale, minutes
step: 1
default: 15
timer_entity: timer.sprinkler # optional, only to reuse your own timer
```

Supports `switch`, `input_boolean`, `light`, `fan`, `cover`, `valve` and anything `homeassistant.turn_on/off` handles.

## Zero setup
Pick the entity, press play. On first start the card creates, per entity:
- a `timer` helper `timer.tsc_<domain>_<object_id>` (survives restarts, keeps all dashboards in sync)
- an automation `tsc_<domain>_<object_id>` that turns the entity off on `timer.finished`

So auto-off runs on the server even if the browser is closed. Creating them needs an **admin** user. Non-admin users fall back to a browser-only countdown (closing the tab skips auto-off). Delete the helper and automation from Settings to undo.
