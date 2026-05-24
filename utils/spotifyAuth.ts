import { createState } from "ags";
import { execAsync } from "ags/process";
import { readFileAsync } from "ags/file"
import GLib from "gi://GLib"

const [token, setToken] = createState("BQCnh2e64xusJ4SryS8YOA8tKCt3FNQZd9xa7XW4hWAX47CT1Yaz-aUXG0ycue0KThGCITpsAvPD80OkQjzd9iTZpAC6dNAkIGzPPDyPjuYZevmUby0aFzcaUY7AQgpPAwpmEhYZNdU9jnTm0c0-uZUVAu5SQrgaNY9YmH6r6CHMZnC_LNyhmAx5z2tCfrMDDnUW5IDK46Vvwcr_1g84RuRJ_0l2JkpG7O1fGg8Ws-kXN2aKbHT_0ADwIL3uph9linrRJw")
export const spotifyAccessToken = token

newAccessToken()

async function newAccessToken() {
  const env = JSON.parse(await readFileAsync("/home/alexmn/.config/ags/.env"))
  const {
    SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET,
    SPOTIFY_REFRESH_TOKEN
  } = env

  const auth = new TextEncoder().encode(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)
  const data = await execAsync([
    "curl", "-s", "-X", "POST",
    "https://accounts.spotify.com/api/token",
    "-H", `Authorization: Basic ${GLib.base64_encode(auth)}`,
    "-H", "Content-Type: application/x-www-form-urlencoded",
    "-d", `grant_type=refresh_token&refresh_token=${SPOTIFY_REFRESH_TOKEN}`
  ]).then(JSON.parse).catch(console.error)

  console.log(`Spotify access token: ${data.access_token}`)
  console.log(`Expires: ${data.expires_in} seconds`)
  setToken(data.access_token)
  setTimeout(newAccessToken, data.expires_in * 1000 - 5000)
}


// async function getAccessToken() {

//   const response = await axios.post(
//     'https://accounts.spotify.com/api/token',
//     new URLSearchParams({
//       grant_type: 'refresh_token',
//       refresh_token: SPOTIFY_REFRESH_TOKEN
//     }),
//     {
//       headers: {
//         Authorization:
//           'Basic ' +
//           Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString(
//             'base64'
//           ),
//         'Content-Type': 'application/x-www-form-urlencoded'
//       }
//     }
//   );

//   cachedToken = response.data.access_token;
//   tokenExpiry = now + response.data.expires_in * 1000 - 5000; // Refresh token 5 seconds before it expires
//   return cachedToken;
// }
