import app from 'ags/gtk4/app';
import { Astal, Gdk } from 'ags/gtk4';
const { TOP, LEFT, RIGHT, BOTTOM } = Astal.WindowAnchor;
import { Apps } from '../widget/Apps';

export default function Dock(gdkmonitor: Gdk.Monitor) {
  return (
    <>
      <window
        visible
        name="dock"
        class="Dock"
        gdkmonitor={gdkmonitor}
        exclusivity={Astal.Exclusivity.EXCLUSIVE}
        anchor={BOTTOM | LEFT | RIGHT}
        application={app}>
        <centerbox cssName="centerbox">
          <box $type="start"></box>
          <box $type="center">
            <Apps />
          </box>
          <box $type="end"></box>
        </centerbox>
      </window>
      {/* popups */}
    </>
  );
}
