import app from 'ags/gtk4/app';
import style from './style.scss';
import Bar from './layout/Bar';
import Dock from './layout/Dock';
import AppLauncher from './feature/AppLauncher';
import WallpaperPicker from './feature/Wallpaper';
import { activePopup, setActivePopup } from './state';

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
    }
  },
  main() {
    app.get_monitors().map(Bar);
    // app.get_monitors().map(Dock);
    app.get_monitors().map(AppLauncher);
    app.get_monitors().map(WallpaperPicker);
  },
});
