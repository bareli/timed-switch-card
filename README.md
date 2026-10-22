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
timer_entity: timer.sprinkler # optional, see below
```

Supports `switch`, `input_boolean`, `light`, `fan`, `cover`, `valve` and anything `homeassistant.turn_on/off` handles.

## Reliability
Without `timer_entity` the countdown runs in the browser tab: close the tab and auto-off does NOT fire. For server-side off, create a `timer` helper and this automation:

```yaml
automation:
  - alias: Sprinkler auto-off
    trigger:
      - platform: event
        event_type: timer.finished
        event_data:
          entity_id: timer.sprinkler
    action:
      - service: homeassistant.turn_off
        target:
          entity_id: switch.garden_lawn_sprinkler
```
Card then reads remaining time from the timer, so all devices stay in sync.
