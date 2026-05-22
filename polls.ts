import { createPoll } from "ags/time"
import { execAsync } from "ags/process"

export const title = createPoll("", 1000, "playerctl metadata xesam:title -p spotify")

export const artist = createPoll(
  "",
  1000,
  "playerctl metadata xesam:artist -p spotify",
)

export const isPlaying = createPoll(false, 200, () =>
  execAsync("playerctl status -p spotify")
    .then((s) => s.trim() === "Playing")
    .catch(() => false),
)

export const wifi = createPoll(
  "",
  5000,
  "nmcli -g name connection show --active",
  (out) => out.split("\n")[0],
)

export const wifiBlocked = createPoll(false, 5000, () =>
  execAsync("rfkill list wifi")
    .then((out) => out.includes("Soft blocked: yes"))
    .catch(() => false),
)

export const bluetoothBlocked = createPoll(false, 5000, () =>
  execAsync("rfkill list bluetooth")
    .then((out) => out.includes("Soft blocked: yes"))
    .catch(() => false),
)

export const volume = createPoll("", 200, "wpctl get-volume @DEFAULT_SINK@", (out) => {
  return Math.floor(parseFloat(out.replace("Volume: ", "")) * 100).toString()
})

export const volumeMuted = createPoll(
  false,
  200,
  "wpctl get-volume @DEFAULT_SINK@",
  (out) => out.includes("[MUTED]"),
)

export const input = createPoll(
  "",
  200,
  "wpctl get-volume @DEFAULT_SOURCE@",
  (out) => {
    return Math.floor(parseFloat(out.replace("Volume: ", "")) * 100).toString()
  },
)

export const inputMuted = createPoll(
  false,
  200,
  "wpctl get-volume @DEFAULT_SOURCE@",
  (out) => out.includes("[MUTED]"),
)

export const appsUsingMic = createPoll(
  [],
  2000,
  [
    "sh",
    "-c",
    `pactl list source-outputs | awk -v mic=$(pactl list sources short | grep "$(pactl info | sed -n 's/^Default Source: //p')" | cut -f1) '/Source:/{src=$2} /application.process.binary/{bin=$3} /application.process.binary/ && src==mic{print bin}'`,
  ],
  (out) =>
    out
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((s) => s.replace(/"/g, "")),
)

export const bluetoothDevice = createPoll(
  "",
  2500,
  ["sh", "-c", "bluetoothctl info | grep Name | cut -d' ' -f2-"],
  (out) => (out ? out : "none"),
)

export const batteryPercent = createPoll(
  "",
  10000,
  "cat /sys/class/power_supply/BAT0/capacity",
)

export const batteryStatus = createPoll("", 5000, ["upower", "-b"], (out) =>
  JSON.stringify(
    Object.fromEntries(
      out
        .split("History")[0]
        .split("\n")
        .filter((x) => x.split(":")[1])
        .map((l) => [l.split(":")[0].trim(), l.split(":")[1].trim()]),
    ),
    null,
    2,
  ),
)

export const notifCount = createPoll("", 5000, "swaync-client -c", (out) =>
  out.replace("%", ""),
)

// const notifIcon = createComputed(() => {
//   if (parseInt(notifCount()) > 0) {
//     return "󱅫"
//   } else {
//     return "󰂚"
//   }
// })
