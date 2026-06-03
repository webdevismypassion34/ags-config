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
import {
  BrightnessButton,
  BrightnessPopup,
} from '../widget/Brightness.tsx';
import { WeatherButton } from '../widget/Weather.tsx';

// layout = x corresponds to _barx.scss
const layout: number = 4;

export default function Bar(gdkmonitor: Gdk.Monitor) {
  return (
    <>
      <window
        visible={layout === 1}
        name="bar"
        class="Bar"
        gdkmonitor={gdkmonitor}
        exclusivity={Astal.Exclusivity.EXCLUSIVE}
        anchor={TOP | LEFT | RIGHT}
        application={app}>
        <centerbox cssName="centerbox">
          <box $type="start">
            <ArchButton />
            <WorkspaceButtons
              icons={{ 1: '', 2: '', 3: '󰈹', 4: '' }}
            />
            <PlayerButton gdkmonitor={gdkmonitor} altLayout={true} />
          </box>
          <box $type="center">
            <Clock />
          </box>
          <box $type="end">
            <WeatherButton gdkmonitor={gdkmonitor} />
            <WifiButton gdkmonitor={gdkmonitor} />
            <BluetoothButton gdkmonitor={gdkmonitor} />
            <BatteryButton gdkmonitor={gdkmonitor} />
            <VolumeButton gdkmonitor={gdkmonitor} />
            <BrightnessButton gdkmonitor={gdkmonitor} />
            <NotificationButton />
          </box>
        </centerbox>
      </window>
      <window
        visible={layout === 2}
        name="bar"
        class="Bar"
        gdkmonitor={gdkmonitor}
        exclusivity={Astal.Exclusivity.EXCLUSIVE}
        anchor={TOP | LEFT | RIGHT}
        application={app}>
        <centerbox cssName="centerbox">
          <box $type="start">
            <ArchButton />
            <WorkspaceButtons
              icons={{
                1: 'I',
                2: 'II',
                3: 'III',
                4: 'IV',
                5: 'V',
                6: 'VI',
                7: 'VII',
                8: 'VIII',
                9: 'IX',
                10: 'X',
              }}
              blankInactive
            />
          </box>
          <box $type="center">
            <BrightnessButton gdkmonitor={gdkmonitor} percent />
            <Clock showDate={false} />
            <VolumeButton gdkmonitor={gdkmonitor} percent />
          </box>
          <box $type="end">
            <WifiButton gdkmonitor={gdkmonitor} display="icon" />
            <BluetoothButton gdkmonitor={gdkmonitor} />
            <BatteryButton
              gdkmonitor={gdkmonitor}
              display="label"
              percent
            />
            <NotificationButton display="icon" />
          </box>
        </centerbox>
      </window>
      <window
        visible={layout === 3}
        name="bar"
        class="Bar"
        gdkmonitor={gdkmonitor}
        exclusivity={Astal.Exclusivity.EXCLUSIVE}
        anchor={TOP | LEFT | RIGHT}
        application={app}>
        wifi, weather (just temperature), digital clock, volume, wifi
        (just the signal strength/not connect/no wifi etc, I don't
        need wifi name, it takes up too much space tbh), bluetooth,
        battery
        <centerbox cssName="centerbox">
          <box $type="start">
            <WeatherButton gdkmonitor={gdkmonitor} minimal />
            <PlayerButton gdkmonitor={gdkmonitor} />
          </box>
          <box $type="center">
            <WorkspaceButtons />
          </box>
          <box $type="end">
            <Clock showDate={false} />
            <VolumeButton gdkmonitor={gdkmonitor} percent />
            <WifiButton gdkmonitor={gdkmonitor} />
            <BatteryButton gdkmonitor={gdkmonitor} display="label" />
          </box>
        </centerbox>
      </window>
      <window
        visible={layout === 4}
        name="bar"
        class="Bar"
        gdkmonitor={gdkmonitor}
        exclusivity={Astal.Exclusivity.EXCLUSIVE}
        anchor={TOP | LEFT | RIGHT}
        application={app}>
        wifi, weather (just temperature), digital clock, volume, wifi
        (just the signal strength/not connect/no wifi etc, I don't
        need wifi name, it takes up too much space tbh), bluetooth,
        battery
        <centerbox cssName="centerbox">
          <box $type="start">
            <WeatherButton gdkmonitor={gdkmonitor} minimal />
          </box>
          <box $type="center">
            <WorkspaceButtons />
          </box>
          <box $type="end">
            <BluetoothButton display="icon" gdkmonitor={gdkmonitor} />
            <WifiButton display="icon" gdkmonitor={gdkmonitor} />
            <VolumeButton gdkmonitor={gdkmonitor} percent />
            <BatteryButton gdkmonitor={gdkmonitor} display="label" />
            <Clock showDate={false} />
          </box>
        </centerbox>
      </window>
      <ArchPopup gdkmonitor={gdkmonitor} />
      <PlayerPopup gdkmonitor={gdkmonitor} />
      <WifiPopup gdkmonitor={gdkmonitor} />
      <BluetoothPopup gdkmonitor={gdkmonitor} />
      <BatteryPopup gdkmonitor={gdkmonitor} />
      <VolumePopup gdkmonitor={gdkmonitor} />
      <BrightnessPopup gdkmonitor={gdkmonitor} />
    </>
  );
}
