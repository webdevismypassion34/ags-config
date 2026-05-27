import app from 'ags/gtk4/app';
import { Astal, Gdk } from 'ags/gtk4';
const { TOP, LEFT, RIGHT } = Astal.WindowAnchor;

import { ArchButton, ArchPopup } from '../widget/Arch.tsx';
import { WorkspaceButtons } from '../widget/Workspaces.tsx';
import { PlayerButton, PlayerPopup } from '../widget/Player.tsx';
import { Clock } from '../widget/Clock.tsx';
import { Keyboard } from '../widget/Keyboard.tsx';
import { WifiButton, WifiPopup } from '../widget/Wifi.tsx';
import {
  BluetoothButton,
  BluetoothPopup,
} from '../widget/Bluetooth.tsx';
import { BatteryButton, BatteryPopup } from '../widget/Battery.tsx';
import { VolumeButton, VolumePopup } from '../widget/Volume.tsx';
import { NotificationButton } from '../widget/Notifications.tsx';

export default function Bar(gdkmonitor: Gdk.Monitor) {
  return (
    <>
      <window
        visible
        name="bar"
        class="Bar"
        gdkmonitor={gdkmonitor}
        exclusivity={Astal.Exclusivity.EXCLUSIVE}
        anchor={TOP | LEFT | RIGHT}
        application={app}>
        <centerbox cssName="centerbox">
          <box $type="start">
            <ArchButton />
            <WorkspaceButtons />
            <PlayerButton gdkmonitor={gdkmonitor} />
          </box>
          <box $type="center">
            <Clock />
          </box>
          <box $type="end">
            <Keyboard />
            <WifiButton gdkmonitor={gdkmonitor} />
            <BluetoothButton gdkmonitor={gdkmonitor} />
            <BatteryButton gdkmonitor={gdkmonitor} />
            <VolumeButton gdkmonitor={gdkmonitor} />
            <NotificationButton />
          </box>
        </centerbox>
      </window>
      <ArchPopup gdkmonitor={gdkmonitor} />
      <PlayerPopup gdkmonitor={gdkmonitor} />
      <WifiPopup gdkmonitor={gdkmonitor} />
      <BluetoothPopup gdkmonitor={gdkmonitor} />
      <BatteryPopup gdkmonitor={gdkmonitor} />
      <VolumePopup gdkmonitor={gdkmonitor} />
    </>
  );
}
