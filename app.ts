import app from 'ags/gtk4/app';
import style from './style.scss';
import Bar from './layout/Bar';
import AppLauncher from './widget/AppLauncher';
import { activePopup, setActivePopup } from './state';

app.start({
  css: style,
  requestHandler(request: string[], res: (response: string) => void) {
    if (request[0] === 'toggleLauncher') {
      setActivePopup(activePopup() == 'launcher' ? null : 'launcher');
      res('ok');
    }
  },
  main() {
    app.get_monitors().map(Bar);
    app.get_monitors().map(AppLauncher);
  },
});
