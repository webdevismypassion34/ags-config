import { execAsync } from 'ags/process';
import { writeFileAsync, readFileAsync } from 'ags/file';
import { home } from '../polls';
import { createState } from 'ags';

type WeatherResponse = {
  latitude?: number;
  longitude?: number;
  generationtime_ms?: number;
  utc_offset_seconds?: number;
  timezone?: string;
  timezone_abbreviation?: string;
  elevation?: number;
  current_units?: {
    time: string;
    interval: string;
    temperature_2m: string;
    weathercode: string;
  };
  current?: {
    time: string;
    interval: number;
    temperature_2m: number;
    weathercode: number;
  };
  daily?: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
};

export const [weather, setWeather] = createState<WeatherResponse>({});

async function getWeather() {
  const cache = await readFileAsync(
    `${home}/.config/ags/weather.json`
  )
    .then(JSON.parse)
    .catch(() => ({ expires: 0 }));
  if (cache.expires > Date.now()) return cache.data;

  const weatherData = await execAsync([
    'curl',
    '-s',
    'https://ipinfo.io/',
  ])
    .then(JSON.parse)
    .then((data: Record<string, string>) => {
      const [lat, long] = data.loc.split(',');

      return execAsync([
        'curl',
        '-s',
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current=temperature_2m,weathercode&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`,
      ]).catch(err => {
        console.error(err);
        return {};
      });
    })
    // @ts-ignoree
    .then(JSON.parse)
    .catch(console.error);

  // await so that it doesn't return before writing
  await writeFileAsync(
    `${home}/.config/ags/weather.json`,
    JSON.stringify(
      { data: weatherData, expires: Date.now() + 900000 }, // 900 000 ms / 900 sec / 15 min
      null,
      2
    )
  );

  return weatherData;
}

const weatherData = await getWeather();
setWeather(weatherData);
