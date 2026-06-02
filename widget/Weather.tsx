import { Gdk, Gtk } from 'ags/gtk4';
import { weather } from '../utils/weather';

weather.subscribe(() => {
  console.log(weather());
});

function weatherIcon(code: number): string {
  if (code === 0) return '󰖙'; // sunny
  if (code <= 2) return '󰖕'; // partly cloudy
  if (code === 3) return '󰖐'; // cloudy
  if (code <= 48) return '󰖑'; // hazy
  if (code <= 57) return '󰼳'; // drizzle
  if (code <= 67) return '󰖗'; // rain
  if (code <= 77) return '󰖘'; // snow
  if (code <= 82) return '󰖖'; // pouring
  if (code <= 86) return '󰙿'; // snowy rainy
  if (code <= 99) return '󰙾'; // thunderstorm
  return '󰖙';
}

function weatherLabel(code: number): string {
  if (code === 0) return 'Sunny';
  if (code <= 2) return 'Partly Cloudy';
  if (code === 3) return 'Cloudy';
  if (code <= 48) return 'Foggy';
  if (code <= 57) return 'Drizzle';
  if (code <= 67) return 'Rainy';
  if (code <= 77) return 'Snowy';
  if (code <= 82) return 'Showers';
  if (code <= 86) return 'Snowy Rainy';
  if (code <= 99) return 'Thunderstorm';
  return 'Unknown';
}

export function WeatherButton({
  gdkmonitor,
  minimal = false,
}: {
  gdkmonitor: Gdk.Monitor;
  minimal?: boolean;
}) {
  return (
    <button class="weather">
      <box orientation={Gtk.Orientation.HORIZONTAL}>
        <label
          class={minimal ? 'icon' : 'weatherIcon'}
          label={weather(w =>
            weatherIcon(w.current?.weathercode ?? 0)
          )}
        />
        <box
          orientation={
            minimal
              ? Gtk.Orientation.HORIZONTAL
              : Gtk.Orientation.VERTICAL
          }>
          <label
            label={weather(
              w =>
                (w.current?.temperature_2m?.toString() ?? '') +
                (minimal
                  ? '°'
                  : (w.current_units?.temperature_2m?.toString() ??
                    ''))
            )}
          />
          <label
            visible={!minimal}
            class="secondary"
            label={weather(w =>
              weatherLabel(w.current?.weathercode ?? 0)
            )}
          />
        </box>
      </box>
    </button>
  );
}

/*
{
    "latitude": 42.339344,
    "longitude": -71.07212,
    "generationtime_ms": 0.11980533599853516,
    "utc_offset_seconds": 0,
    "timezone": "GMT",
    "timezone_abbreviation": "GMT",
    "elevation": 20,
    "current_units": {
        "time": "iso8601",
        "interval": "seconds",
        "temperature_2m": "°C",
        "weathercode": "wmo code"
    },
    "current": {
        "time": "2026-06-02T01:15",
        "interval": 900,
        "temperature_2m": 11.3,
        "weathercode": 0
    }
}
*/
