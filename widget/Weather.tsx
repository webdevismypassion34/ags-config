import { Gdk, Gtk } from 'ags/gtk4';
import { weather } from '../utils/weather';
import Popup from '../components/Popup';
import { activePopup, setActivePopup } from '../state';
import { createState, For } from 'ags';
import { centeredMargin } from '../utils/margin';

const [weatherMargin, setWeatherMargin] = createState(0);

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
  function toggleWeather() {
    if (activePopup() == 'weather') {
      setActivePopup(null);
    } else {
      setWeatherMargin(centeredMargin(weatherButtonRef, gdkmonitor));
      setActivePopup('weather');
    }
  }

  let weatherButtonRef!: Gtk.Widget;

  return (
    <button
      $={self => {
        weatherButtonRef = self;
        self.set_cursor(Gdk.Cursor.new_from_name('pointer', null));
      }}
      class="weather"
      onClicked={() => {
        toggleWeather();
      }}>
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
            halign={Gtk.Align.START}
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
  "data": {
    "latitude": 42.339344,
    "longitude": -71.07212,
    "generationtime_ms": 0.308990478515625,
    "utc_offset_seconds": -14400,
    "timezone": "America/New_York",
    "timezone_abbreviation": "GMT-4",
    "elevation": 20,
    "current_units": {
      "time": "iso8601",
      "interval": "seconds",
      "temperature_2m": "°C",
      "weathercode": "wmo code"
    },
    "current": {
      "time": "2026-06-06T14:45",
      "interval": 900,
      "temperature_2m": 31.6,
      "weathercode": 3
    },
    "daily_units": {
      "time": "iso8601",
      "weather_code": "wmo code",
      "temperature_2m_max": "°C",
      "temperature_2m_min": "°C"
    },
    "daily": {
      "time": [
        "2026-06-06",
        "2026-06-07",
        "2026-06-08",
        "2026-06-09",
        "2026-06-10",
        "2026-06-11",
        "2026-06-12"
      ],
      "weather_code": [
        3,
        63,
        3,
        3,
        80,
        53,
        3
      ],
      "temperature_2m_max": [
        32.1,
        28,
        26,
        32.4,
        33.3,
        22.2,
        23.4
      ],
      "temperature_2m_min": [
        17,
        17.1,
        13.2,
        14.6,
        18.9,
        15.8,
        14.3
      ]
    }
  },
  "expires": 1780772575542
}
*/

const forecastDisplay = (day: string) => {
  const entry = weather().daily?.time?.indexOf(day);
  const data: [string, number, string, string] = Object.values(
    weather().daily ?? {}
  ).map(e => e[entry ?? 0]) as [string, number, string, string];
  const days = weather().daily?.time.map((_, i) =>
    new Intl.RelativeTimeFormat('en', {
      numeric: 'auto',
    }).format(i, 'day')
  );

  return (
    <box
      widthRequest={110}
      orientation={Gtk.Orientation.VERTICAL}
      halign={Gtk.Align.START}
      class="day">
      <label
        label={(days ?? [])[entry ?? 0]}
        class="dayLabel"
        halign={Gtk.Align.START}
      />
      <label
        label={
          weatherIcon(data[1] ?? 0) + ' ' + weatherLabel(data[1] ?? 0)
        }
        class="condition"
        halign={Gtk.Align.START}
      />
      <label
        label={
          'max: ' +
          data[2] +
          (weather().current_units?.temperature_2m?.toString() ?? '')
        }
        class="max"
        halign={Gtk.Align.START}
      />
      <label
        label={
          'min: ' +
          data[3] +
          (weather().current_units?.temperature_2m?.toString() ?? '')
        }
        class="min"
        halign={Gtk.Align.START}
      />
    </box>
  );
};

export function WeatherPopup({
  gdkmonitor,
}: {
  gdkmonitor: Gdk.Monitor;
}) {
  return (
    <Popup
      gdkmonitor={gdkmonitor}
      name="weatherPopup"
      visible={activePopup(a => a == 'weather')}
      margin={weatherMargin}
      cssClass="weatherOverlay">
      <box orientation={Gtk.Orientation.VERTICAL}>
        <box orientation={Gtk.Orientation.HORIZONTAL}>
          <For each={weather(w => w.daily?.time.slice(0, 3) ?? [])}>
            {forecastDisplay}
          </For>
        </box>
        <box orientation={Gtk.Orientation.HORIZONTAL}>
          <For each={weather(w => w.daily?.time.slice(3, 6) ?? [])}>
            {forecastDisplay}
          </For>
        </box>
      </box>
    </Popup>
  );
}
