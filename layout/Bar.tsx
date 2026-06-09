import app from 'ags/gtk4/app';
import { Astal, Gdk } from 'ags/gtk4';
const { TOP, LEFT, RIGHT } = Astal.WindowAnchor;
import settings, { Layout } from '../utils/settings.ts';
import { buttonsFromLayout, mountPopups } from './renderer.tsx';

let layout: Layout = settings().bar?.layout as Layout;

export default function Bar(gdkmonitor: Gdk.Monitor) {
  mountPopups(layout, gdkmonitor);
  return (
    <window
      visible={true}
      name="bar"
      class="Bar"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={TOP | LEFT | RIGHT}
      application={app}>
      {buttonsFromLayout(layout, gdkmonitor)}
    </window>
  );
}
