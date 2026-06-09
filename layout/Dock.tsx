import app from 'ags/gtk4/app';
import { Astal, Gdk } from 'ags/gtk4';
const { TOP, LEFT, RIGHT, BOTTOM } = Astal.WindowAnchor;
import settings, { Layout } from '../utils/settings';
import { buttonsFromLayout, mountPopups } from './renderer';

let layout: Layout = settings().dock?.layout as Layout;

export default function Dock(gdkmonitor: Gdk.Monitor) {
  mountPopups(layout, gdkmonitor);
  return (
    <window
      visible={true}
      name="dock"
      class="Dock"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={BOTTOM | LEFT | RIGHT}
      application={app}>
      {buttonsFromLayout(layout, gdkmonitor)}
    </window>
  );
}
