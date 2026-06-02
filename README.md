# AGS Config

These are my config files for Aylur's GTK Shell, a GTK-based desktop shell framework. This has been tested on Arch Linux with Hyprland, I am not sure if it works on other distros or compositors.

### Features

**Layouts:**

- Bar
- Dock

**Features:**

- App Launcher
- OSD (On-Screen Display) for brightness and volume
- Wallpaper

**Widgets:**

- Apps: list the open apps and click to go to it or open a list of opened instances if more than one open
- Arch: click to view a list of options inspired by Mac
- Battery: view the battery and click to see how much is charging and how much time to full/empty
  - Props: `percent<boolean>`, `display<"both" | "label"| "icon">`
- Bluetooth: view the currently connected Bluetooth device and click it to list, scan, and connect to devices
  - Props: `display<"both" | "label"| "icon">`
- Brightness: see the brightness, click to open a menu with a slider
  - Props: `percent<boolean>`, `display<"both" | "label"| "icon">`
- Clock: clock and date
  - Props: `hour12<boolean>`, `showDate<boolean>`
- Keyboard: show fcitx5 keyboard, caps lock, and num lock status
- Notifications: show unread notifications, click it to open swaync
  - Props: `display<"both" | "label"| "icon">`
- Player: show artist and title, optionally cover art (with alt layout)
  - Props: `altLayout<boolean>`
- Volume: show volume, click to open a menu with sliders to change volume and mic volume
  - Props: `percent<boolean>`, `display<"both" | "label"| "icon">`
- Workspaces: lists the workspaces, click to go to it
  - Props: `icons<string[]>`, `hideInactive<boolean>`
- Wifi: shows connected wifi and strength and click it to list and connect to wifi networks
  - Props: `display<"both" | "label"| "icon">`

### Screenshots

<details>
<summary>Bar/Dock Styles</summary>

![](./screenshots/screenshot-20260601-180313.png)<br>
_Bar Style 1 (I use this one)_

![](./screenshots/screenshot-20260601-181852.png)
_Dock style 1_

![](./screenshots/screenshot-20260601-174843.png)<br>
_Bar Style 2 (Made to test out making other styles, replicated dusklinux/dusky)_

![](./screenshots/screenshot-20260601-183210.png)<br>
_Dock Style 2_

</details>

<details>
<summary>Popups</summary>

![](./screenshots/screenshot-20260601-180450.png)<br>
_Arch_

![](./screenshots/screenshot-20260601-180457.png)<br>
_Player_

![](./screenshots/screenshot-20260601-180509.png)<br>
_Wifi_

![](./screenshots/screenshot-20260601-181628.png)<br>
_Bluetooth_

![](./screenshots/screenshot-20260601-180625.png)<br>
_Battery_

![](./screenshots/screenshot-20260601-180631.png)<br>
_Volume_

![](./screenshots/screenshot-20260601-180637.png)<br>
_Brightness_

![](./screenshots/screenshot-20260601-182041.png)<br>
_Apps_

</details>

<details>
<summary>Features</summary>

<img src="./screenshots/screenshot-20260601-195938.png" width="600" />

_App Launcher_

<img src="./screenshots/screenshot-20260601-200535.png" width="600" />

_App Launcher Calculator_

<img src="./screenshots/screenshot-20260601-200003.png" width="600" />

_Wallpaper Selector, images above and below are previews of above and below, use arrow keys to cycle through_

![](./screenshots/screenshot-20260601-200101.png)<br>
_Volume OSD_

![](./screenshots/screenshot-20260601-201107.png)<br>
_Brightness OSD_

</details>

### Installing

I'll probably write an install script if people actually use this config

1. Clone the repo: `git clone https://github.com/webdevismypassion34/ags-config.git`
2. Move it to the AGS folder: `mv ags-config ~/.config/ags`
3. Cd into it: `cd ~/.config/ags`
4. Install global dependencies: `yay -S aylurs-gtk-shell-git`, `sudo pacman -S hyprlock playerctl networkmanager bluez-utils swaync wl-clipboard libqalculate fcitx5 kitty upower curl matugen pipewire wireplumber ttf-nerd-fonts-symbols notify-send`
5. Install npm dependencies: `npm install`
6. (optional) Change the following options: terminal in `./feature/appLauncher.tsx` (app used as terminal), wallpaperDirectory in `./feature/Wallpaper.tsx` (where your wallpapers are stored after ~), visualClassOverrides in `./utils/appList.ts` (any apps you want renamed), commands in `./widget/Arch.tsx` (what command to run for the following actions: lock, reboot, logout, shutdown)
7. (optional) If you want spotify queue to work in the player popup, create a `./.env` file formatted like this:

```json
{
  "SPOTIFY_CLIENT_ID": "...",
  "SPOTIFY_CLIENT_SECRET": "...",
  "SPOTIFY_REFRESH_TOKEN": "...",
  "SPOTIFY_CACHED_TOKEN": "anything can be put here, as it is overwritten with the cached token",
  "SPOTIFY_CACHE_EXPIRATION": 0
}
```

If you don't want the queue to work, comment out `<PlayerPopup gdkmonitor={gdkmonitor} />` in `./layout/Bar.tsx`

8. (optional) Replace the contents of `./icons.json` (the app icons cache) with {}, it will build a cache on the first run, after that you can edit it if any icons aren't being detected to replace `class` with the `window.initialClass` or change any icons. You don't need to reset it, as the paths use `/home/alexmn`, which is personal to my system. This will only take up space, not cause any issues.

9. Run ags: `ags run` or `setsid ags run` to detach from terminal

10. Add keybinds to your Hyprland config for wallpaper and app launcher, any keybinds work:

```conf
bind = $mainMod, D, exec, ags request "toggleLauncher"
bind = $mainMod, W, exec, ags request "toggleWallpaper"
```

If you don't want these features, comment them out in `./app.ts`

11. Add keybinds to your Hyprland config for the on-screen brightness and volume display:

```config
bindel = ,XF86AudioRaiseVolume, exec, wpctl set-volume -l 1 @DEFAULT_AUDIO_SINK@ 5%+ && ags request "updateVolume" $(wpctl get-volume @DEFAULT_AUDIO_SINK@)
bindel = ,XF86AudioLowerVolume, exec, wpctl set-volume @DEFAULT_AUDIO_SINK@ 5%- && ags request "updateVolume" $(wpctl get-volume @DEFAULT_AUDIO_SINK@)

bindel = ,XF86MonBrightnessUp, exec, brightnessctl -e4 -n2 set 5%+ && wpctl set-volume @DEFAULT_AUDIO_SINK@ 5%- && ags request "updateBrightness" $(brightnessctl -m)
bindel = ,XF86MonBrightnessDown, exec, brightnessctl -e4 -n2 set 5%- && ags request "updateBrightness" $(brightnessctl -m)
```

The important parts are `ags request "updateVolume" $(wpctl get-volume @DEFAULT_AUDIO_SINK@)` and `ags request "updateBrightness" $(brightnessctl -m)`

If you don't want this feature, comment out `app.get_monitors().map(OSD)` in `./app.ts`

12. (optional) Enable blur by adding this to your Hyprland config:

```conf
; ags
layerrule = blur on, match:namespace gtk4-layer-shell
layerrule = ignore_alpha 0.1, match:namespace gtk4-layer-shell
; swaync
layerrule = blur on, match:namespace swaync-control-center
layerrule = ignore_alpha 0.1, match:namespace swaync-control-center
```

### Matugen

1. Make a file at `~/.config/matugen/templates/ags.scss` with this:

```scss
$bg:       {{colors.background.dark.hex}};
$fg:       {{colors.on_background.dark.hex}};
$border:   {{colors.outline_variant.dark.hex}}7F;
$surface0: {{colors.surface_container.dark.hex}};
$surface1: {{colors.surface_container_high.dark.hex}};
$surface2: {{colors.surface_container_highest.dark.hex}};
$overlay0: {{colors.outline_variant.dark.hex}};
$overlay1: {{colors.on_surface_variant.dark.hex}};
$overlay2: {{colors.on_surface.dark.hex}};
$subtext0: {{colors.on_surface_variant.dark.hex}};
$subtext1: {{colors.on_surface.dark.hex}};
```

2. Add this to config.toml:

```toml
[templates.ags]
input_path = '~/.config/matugen/templates/ags.scss'
output_path = '~/.config/ags/matugen.scss'
```
