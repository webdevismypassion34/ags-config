import { createState } from 'ags';
import { execAsync } from 'ags/process';
import { readFileAsync, writeFileAsync } from 'ags/file';
import { home } from '../polls';
import GLib from 'gi://GLib';

const [token, setToken] = createState('');
export const spotifyAccessToken = token;

newAccessToken();

async function newAccessToken() {
  try {
    const env = JSON.parse(
      await readFileAsync(`${home}/.config/ags/.env`)
    );
    const {
      SPOTIFY_CLIENT_ID,
      SPOTIFY_CLIENT_SECRET,
      SPOTIFY_REFRESH_TOKEN,
      SPOTIFY_CACHED_TOKEN,
      SPOTIFY_CACHE_EXPIRATION,
    }: {
      SPOTIFY_CLIENT_ID: string;
      SPOTIFY_CLIENT_SECRET: string;
      SPOTIFY_REFRESH_TOKEN: string;
      SPOTIFY_CACHED_TOKEN: string;
      SPOTIFY_CACHE_EXPIRATION: number;
    } = env;

    if (Date.now() < SPOTIFY_CACHE_EXPIRATION) {
      setToken(SPOTIFY_CACHED_TOKEN);
      setTimeout(
        newAccessToken,
        SPOTIFY_CACHE_EXPIRATION - Date.now()
      );
      return;
    }

    const auth = new TextEncoder().encode(
      `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
    );
    const data: { expires_in: number; access_token: string } =
      JSON.parse(
        await execAsync([
          'curl',
          '-s',
          '-X',
          'POST',
          'https://accounts.spotify.com/api/token',
          '-H',
          `Authorization: Basic ${GLib.base64_encode(auth)}`,
          '-H',
          'Content-Type: application/x-www-form-urlencoded',
          '-d',
          `grant_type=refresh_token&refresh_token=${SPOTIFY_REFRESH_TOKEN}`,
        ])
      );

    if (!data.access_token)
      throw new Error(
        `No access token in response: ${JSON.stringify(data)}`
      );

    setToken(data.access_token);
    const expires = data.expires_in * 1000 - 30000; // kept getting issues with token being expired, so lowering expiration date more
    await writeFileAsync(
      `${home}/.config/ags/.env`,
      JSON.stringify(
        {
          SPOTIFY_CLIENT_ID,
          SPOTIFY_CLIENT_SECRET,
          SPOTIFY_REFRESH_TOKEN,
          SPOTIFY_CACHED_TOKEN: data.access_token,
          SPOTIFY_CACHE_EXPIRATION: Date.now() + expires,
        },
        null,
        2
      )
    );
    setTimeout(newAccessToken, expires);
  } catch (err) {
    console.error(
      `Failed to refresh Spotify access token, retrying in 30s: ${err}`
    );
    setTimeout(newAccessToken, 30000);
  }
}
