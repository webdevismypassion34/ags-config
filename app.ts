import app from 'ags/gtk4/app';
import Bar from './layout/Bar';
import Dock from './layout/Dock';
import AppLauncher from './feature/AppLauncher';
import WallpaperPicker from './feature/Wallpaper';
import NotificationAlert from './feature/Notifications';
import { activePopup, setActivePopup } from './state';
import OSD from './feature/OSD';
import { setBrightness, setVolume } from './feature/OSD';
import { setTempVolume } from './widget/Volume';
import { setTempBrightness } from './widget/Brightness';
import { startDaemon } from './utils/notifications';
import { notifications } from './utils/notifications';

import popups1 from './_popups1.scss';
import bar1 from './_bar1.scss';
import bar2 from './_bar2.scss';
import bar3 from './_bar3.scss';
import bar4 from './_bar4.scss';

const { panelStyle, popupStyle } = settings();

const panelFromStyle = (n: number) => {
  switch (n) {
    case 1:
      return bar1;
    case 2:
      return bar2;
    case 3:
      return bar3;
    case 4:
      return bar4;
    default:
      return bar1;
  }
};

const popupFromStyle = (n: number) => {
  switch (n) {
    case 1:
      return popups1;
    default:
      return popups1;
  }
};

const combinedStyle =
  panelFromStyle(panelStyle as number) +
  popupFromStyle(popupStyle as number);

import settings from './utils/settings';
import { startMprisDaemon } from './utils/mpris';

app.start({
  css: combinedStyle,
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
    if (request[0] === 'notifications') {
      res(JSON.stringify(notifications()));
    }
  },
  main() {
    startMprisDaemon();
    if (settings().useNotificationDaemon) startDaemon();
    if (settings().bar?.enabled) app.get_monitors().map(Bar);
    if (settings().dock?.enabled) app.get_monitors().map(Dock);
    if (settings().osd?.enabled) app.get_monitors().map(OSD);
    if (settings().appLauncher?.enabled)
      app.get_monitors().map(AppLauncher);
    if (settings().wallpaper?.enabled)
      app.get_monitors().map(WallpaperPicker);
    if (settings().useNotificationDaemon)
      app.get_monitors().map(NotificationAlert);
  },
});
