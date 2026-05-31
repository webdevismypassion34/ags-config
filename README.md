# AGS Config

These are my config files for Aylur's GTK Shell, a GTK-based desktop shell framework. This has been tested on Arch Linux with Hyprland, I am not sure if it works on other distros or compositors.

### Installing

I'll probably write an install script if people actually use this config

1. Clone the repo: `git clone https://github.com/webdevismypassion34/ags-config.git`
2. Move it to the AGS folder: `mv ags-config ~/.config/ags`
3. Cd into it: `cd ~/.config/ags`
4. Install global dependencies: `yay -S aylurs-gtk-shell-git`, `sudo pacman -S hyprlock playerctl networkmanager bluez-utils swaync wl-clipboard libqalculate fcitx5 kitty upower curl matugen pipewire wireplumber`
5. Install npm dependencies: `npm install`
6. (optional) Change the following options: terminal in `./feature/appLauncher.tsx` (app used as terminal), wallpaperDirectory in `./feature/Wallpaper.tsx` (where your wallpapers are stored after ~), visualClassOverrides in `./utils/appList.ts` (any apps you want renamed)
7. (optional) if you want spotify queue to work in the player popup, create a `./.env` file formatted like this:

```json
{
  "SPOTIFY_CLIENT_ID": "...",
  "SPOTIFY_CLIENT_SECRET": "...",
  "SPOTIFY_REFRESH_TOKEN": "...",
  "SPOTIFY_CACHED_TOKEN": "anything can be put here, as it is overwritten with the cached token",
  "SPOTIFY_CACHE_EXPIRATION": 0
}
```

If you don't want the queue to work, comment out `<PlayerPopup gdkmonitor={gdkmonitor} />` in `./layout/Bar.tsx` 8. Replace `./icons.json` (the app icons cache) with {}, it will build a cache on the first run, after that you can edit it if any icons aren't being detected to replace `class` with the `window.initialClass` or change any icons 9. Run ags: `ags run` or `setsid ags run` to detach from terminal 10. Add keybinds to your Hyprland config for wallpaper and app launcher, any keybinds work:

```conf
bind = $mainMod, D, exec, ags request "toggleLauncher"
bind = $mainMod, W, exec, ags request "toggleWallpaper"
```
If you don't want these features, comment them out in `./app.ts` 

11. Add keybinds to your Hyprland config for the on-screen brightness and volume display:

```conf
bindel = ,XF86AudioRaiseVolume, exec, wpctl set-volume -l 1 @DEFAULT_AUDIO_SINK@ 5%+ && ags request "updateVolume" $(wpctl get-volume @DEFAULT_AUDIO_SINK@)
bindel = ,XF86AudioLowerVolume, exec, wpctl set-volume @DEFAULT_AUDIO_SINK@ 5%- && ags request "updateVolume" $(wpctl get-volume @DEFAULT_AUDIO_SINK@)

bindel = ,XF86MonBrightnessUp, exec, brightnessctl -e4 -n2 set 5%+ && wpctl set-volume @DEFAULT_AUDIO_SINK@ 5%- && ags request "updateBrightness" $(brightnessctl -m)
bindel = ,XF86MonBrightnessDown, exec, brightnessctl -e4 -n2 set 5%- && ags request "updateBrightness" $(brightnessctl -m)
```
If you don't want this feature, comment out `app.get_monitors().map(OSD)` in `./app.ts`
