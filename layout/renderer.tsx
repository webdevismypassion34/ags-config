import { Gdk } from 'ags/gtk4';
import settings, { Layout } from '../utils/settings';
import { ArchButton, ArchPopup } from '../widget/Arch';
import { WorkspaceButtons } from '../widget/Workspaces';
import { PlayerButton, PlayerPopup } from '../widget/Player';
import { Clock, ClockPopup, ClockAlert } from '../widget/Clock';
import { Keyboard } from '../widget/Keyboard';
import { WifiButton, WifiPopup } from '../widget/Wifi';
import { BluetoothButton, BluetoothPopup } from '../widget/Bluetooth';
import { BatteryButton, BatteryPopup } from '../widget/Battery';
import { VolumeButton, VolumePopup } from '../widget/Volume';
import { Apps, AppsPopup } from '../widget/Apps';
import {
  NotificationButton,
  NotificationPopup,
} from '../widget/Notifications';
import {
  BrightnessButton,
  BrightnessPopup,
} from '../widget/Brightness';
import { WeatherButton, WeatherPopup } from '../widget/Weather';

function buttonFromWidget(widget: string, gdkmonitor: Gdk.Monitor) {
  const w = settings().widgets;
  switch (widget) {
    case 'apps':
      return (
        <Apps gdkmonitor={gdkmonitor} display={w?.apps?.display} />
      );
    case 'arch':
      return <ArchButton />;
    case 'workspaces':
      return (
        <WorkspaceButtons
          icons={w?.workspaces?.icons ?? {}}
          blankInactive={w?.workspaces?.hideInactive}
        />
      );
    case 'player':
      return (
        <PlayerButton
          gdkmonitor={gdkmonitor}
          altLayout={w?.player?.altLayout}
        />
      );
    case 'clock':
      return (
        <Clock
          gdkmonitor={gdkmonitor}
          hour12={w?.clock?.hour12}
          showDate={w?.clock?.showDate}
          stacked={w?.clock?.stacked}
        />
      );
    case 'keyboard':
      return (
        <Keyboard
          fcitx5={w?.keyboard?.fcitx5}
          caps_lock={w?.keyboard?.caps_lock}
          num_lock={w?.keyboard?.num_lock}
        />
      );
    case 'wifi':
      return (
        <WifiButton
          gdkmonitor={gdkmonitor}
          display={w?.wifi?.display}
        />
      );
    case 'bluetooth':
      return (
        <BluetoothButton
          gdkmonitor={gdkmonitor}
          display={w?.bluetooth?.display}
        />
      );
    case 'battery':
      return (
        <BatteryButton
          gdkmonitor={gdkmonitor}
          display={w?.battery?.display}
          percent={w?.battery?.percent}
        />
      );
    case 'volume':
      return (
        <VolumeButton
          gdkmonitor={gdkmonitor}
          display={w?.volume?.display}
          percent={w?.volume?.percent}
        />
      );
    case 'brightness':
      return (
        <BrightnessButton
          gdkmonitor={gdkmonitor}
          display={w?.brightness?.display}
          percent={w?.brightness?.percent}
        />
      );
    case 'notifications':
      return (
        <NotificationButton display={w?.notifications?.display} />
      );
    case 'weather':
      return (
        <WeatherButton
          gdkmonitor={gdkmonitor}
          minimal={w?.weather?.minimal}
        />
      );
    default:
      return null;
  }
}

export function buttonsFromLayout(
  layout: Layout,
  gdkmonitor: Gdk.Monitor
) {
  return (
    <centerbox cssName="centerbox">
      <box $type="start">
        {layout.left.map(w => buttonFromWidget(w, gdkmonitor))}
      </box>
      <box $type="center">
        {layout.center.map(w => buttonFromWidget(w, gdkmonitor))}
      </box>
      <box $type="end">
        {layout.right.map(w => buttonFromWidget(w, gdkmonitor))}
      </box>
    </centerbox>
  );
}

export function mountPopups(layout: Layout, gdkmonitor: Gdk.Monitor) {
  const all = [...layout.left, ...layout.center, ...layout.right];
  if (all.includes('apps')) <AppsPopup gdkmonitor={gdkmonitor} />;
  if (all.includes('arch')) <ArchPopup gdkmonitor={gdkmonitor} />;
  if (all.includes('player')) <PlayerPopup gdkmonitor={gdkmonitor} />;
  if (all.includes('clock')) <ClockPopup gdkmonitor={gdkmonitor} />;
  if (all.includes('clock')) <ClockAlert gdkmonitor={gdkmonitor} />;
  if (all.includes('weather'))
    <WeatherPopup gdkmonitor={gdkmonitor} />;
  if (all.includes('wifi')) <WifiPopup gdkmonitor={gdkmonitor} />;
  if (all.includes('bluetooth'))
    <BluetoothPopup gdkmonitor={gdkmonitor} />;
  if (all.includes('battery'))
    <BatteryPopup gdkmonitor={gdkmonitor} />;
  if (all.includes('volume')) <VolumePopup gdkmonitor={gdkmonitor} />;
  if (all.includes('brightness'))
    <BrightnessPopup gdkmonitor={gdkmonitor} />;
  if (all.includes('notifications'))
    <NotificationPopup gdkmonitor={gdkmonitor} />;
}
