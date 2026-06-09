import app from 'ags/gtk4/app';
import style from './style.scss';
import Bar from './layout/Bar';
import Dock from './layout/Dock';
import AppLauncher from './feature/AppLauncher';
import WallpaperPicker from './feature/Wallpaper';
import { activePopup, setActivePopup } from './state';
import OSD from './feature/OSD';
import { setBrightness, setVolume } from './feature/OSD';
import { setTempVolume } from './widget/Volume';
import { setTempBrightness } from './widget/Brightness';

import settings from './utils/settings';

app.start({
  css: style,
  requestHandler(request: string[], res: (response: string) => void) {
    if (request[0] === 'toggleLauncher') {
      setActivePopup(activePopup() == 'launcher' ? null : 'launcher');
      res('ok');
    }
    if (request[0] === 'toggleWallpaper') {
      setActivePopup(
        activePopup() === 'wallpaper' ? null : 'wallpaper'
      );
      res('ok');
    }
    if (request[0] === 'updateBrightness') {
      setBrightness(
        parseInt(request[1].split(',')[3].replace('%', ''))
      );
      setTempBrightness(
        parseInt(request[1].split(',')[3].replace('%', ''))
      );
      res('ok');
    }
    if (request[0] === 'updateVolume') {
      setVolume(Math.round(parseFloat(request[2]) * 100));
      setTempVolume(
        Math.round(parseFloat(request[2]) * 100).toString()
      );
      res('ok');
    }
  },
  main() {
    if (settings().bar?.enabled) app.get_monitors().map(Bar);
    if (settings().dock?.enabled) app.get_monitors().map(Dock);
    if (settings().osd?.enabled) app.get_monitors().map(OSD);
    if (settings().appLauncher?.enabled)
      app.get_monitors().map(AppLauncher);
    if (settings().wallpaper?.enabled)
      app.get_monitors().map(WallpaperPicker);
  },
});
