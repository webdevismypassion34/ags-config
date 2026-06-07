import { createState } from 'ags';
import { Gtk } from 'ags/gtk4';

const [now, setNow] = createState(new Date());

setTimeout(
  () => {
    setNow(new Date());
    setInterval(() => setNow(new Date()), 60000);
  },
  60000 - (Date.now() % 60000)
);

export function Clock({
  hour12 = false,
  showDate = true,
  stacked = false,
}: {
  hour12?: boolean;
  showDate?: boolean;
  stacked?: boolean;
}) {
  const label = now(d => {
    const time = d.toLocaleTimeString('en-US', {
      hour12,
      timeStyle: 'short',
    });
    if (!showDate) return [time];
    const date = d.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
    });
    return [time, date];
  });

  return (
    <button class="clock">
      <box
        orientation={
          stacked
            ? Gtk.Orientation.VERTICAL
            : Gtk.Orientation.HORIZONTAL
        }>
        <label label={label(v => v[0])} />
        <label visible={!stacked} label=" " />
        <label
          visible={showDate}
          class={stacked ? 'secondary date' : 'date'}
          label={label(v => v[1] ?? '')}
        />
      </box>
    </button>
  );
}

// popup will have alarms, stopwatches, world clock, maybe also calendar
