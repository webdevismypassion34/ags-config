import { createState } from "ags";
import { execAsync } from "ags/process";
import { readFileAsync, writeFileAsync } from "ags/file"
import GLib from "gi://GLib"

const [token, setToken] = createState("BQCnh2e64xusJ4SryS8YOA8tKCt3FNQZd9xa7XW4hWAX47CT1Yaz-aUXG0ycue0KThGCITpsAvPD80OkQjzd9iTZpAC6dNAkIGzPPDyPjuYZevmUby0aFzcaUY7AQgpPAwpmEhYZNdU9jnTm0c0-uZUVAu5SQrgaNY9YmH6r6CHMZnC_LNyhmAx5z2tCfrMDDnUW5IDK46Vvwcr_1g84RuRJ_0l2JkpG7O1fGg8Ws-kXN2aKbHT_0ADwIL3uph9linrRJw")
export const spotifyAccessToken = token

newAccessToken()

async function newAccessToken() {
  const env = JSON.parse(await readFileAsync("/home/alexmn/.config/ags/.env"))
  const {
    SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET,
    SPOTIFY_REFRESH_TOKEN,
    SPOTIFY_CACHED_TOKEN,
    SPOTIFY_CACHE_EXPIRATION
  }: {
    SPOTIFY_CLIENT_ID: string,
    SPOTIFY_CLIENT_SECRET: string,
    SPOTIFY_REFRESH_TOKEN: string,
    SPOTIFY_CACHED_TOKEN: string,
    SPOTIFY_CACHE_EXPIRATION: number
  } = env

  if (Date.now() < SPOTIFY_CACHE_EXPIRATION) {
    setToken(SPOTIFY_CACHED_TOKEN)
    setTimeout(newAccessToken, SPOTIFY_CACHE_EXPIRATION - Date.now())
    return console.log(`Using cached token. Expiring in ${(SPOTIFY_CACHE_EXPIRATION - Date.now()) / 1000} seconds`)
  }

  const auth = new TextEncoder().encode(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)
  const data: { expires_in: number, access_token: string } = await execAsync([
    "curl", "-s", "-X", "POST",
    "https://accounts.spotify.com/api/token",
    "-H", `Authorization: Basic ${GLib.base64_encode(auth)}`,
    "-H", "Content-Type: application/x-www-form-urlencoded",
    "-d", `grant_type=refresh_token&refresh_token=${SPOTIFY_REFRESH_TOKEN}`
  ]).then(JSON.parse).catch(console.error)

  console.log(`Spotify access token: ${data.access_token.substring(0, 20)}...`)
  console.log(`Expires: ${data.expires_in} seconds`)
  setToken(data.access_token)
  let expires = data.expires_in * 1000 - 5000
  await writeFileAsync('/home/alexmn/.config/ags/.env', JSON.stringify(
    {
      SPOTIFY_CLIENT_ID,
      SPOTIFY_CLIENT_SECRET,
      SPOTIFY_REFRESH_TOKEN,
      SPOTIFY_CACHED_TOKEN: data.access_token,
      SPOTIFY_CACHE_EXPIRATION: Date.now() + expires
    }, null, 2))
  setTimeout(newAccessToken, expires)
}
