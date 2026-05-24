import { Gtk, Gdk } from 'ags/gtk4';

function getWidgetCenterX(widget: Gtk.Widget): number {
  const root = widget.get_root();
  if (!root) return 0;
  const [ok, rect] = widget.compute_bounds(root as Gtk.Widget);
  return ok ? Math.round(rect.origin.x + rect.size.width / 2) : 0;
}

export function centeredMargin(
  widget: Gtk.Widget,
  gdkmonitor: Gdk.Monitor
): number {
  return (
    2 * getWidgetCenterX(widget) - gdkmonitor.get_geometry().width
  );
}

export function startMargin(widget: Gtk.Widget): number {
  const root = widget.get_root();
  if (!root) return 0;
  const [ok, rect] = widget.compute_bounds(root as Gtk.Widget);
  return ok ? Math.round(rect.origin.x) : 0;
}
