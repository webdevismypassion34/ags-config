import { createState, For } from 'ags';
import { Gdk, Gtk } from 'ags/gtk4';
import Popup from '../components/Popup';
import { activePopup, setActivePopup } from '../state';
import { centeredMargin } from '../utils/margin';
import {
  timers,
  currentTimer,
  createTimer,
  pauseTimer,
  deleteTimer,
  Timer,
} from '../utils/timers.ts';
import { cssColor } from '../utils/parseCss.ts';

const [now, setNow] = createState(new Date());
const [clockMargin, setClockMargin] = createState(0);

setTimeout(
  () => {
    setNow(new Date());
    setInterval(() => setNow(new Date()), 10);
  },
  10 - (Date.now() % 10)
);

export function Clock({
  gdkmonitor,
  hour12 = false,
  showDate = true,
  stacked = false,
}: {
  gdkmonitor: Gdk.Monitor;
  hour12?: boolean;
  showDate?: boolean;
  stacked?: boolean;
}) {
  function toggleClock() {
    if (activePopup() == 'clock') {
      setActivePopup(null);
    } else {
      setClockMargin(centeredMargin(clockButtonRef, gdkmonitor));
      setActivePopup('clock');
    }
  }

  let clockButtonRef!: Gtk.Widget;

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
    <button
      $={self => {
        clockButtonRef = self;
        self.set_cursor(Gdk.Cursor.new_from_name('pointer', null));
      }}
      class="clock"
      onClicked={() => {
        toggleClock();
      }}>
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

function formatDuration(totalSeconds: number): string {
  const s = Math.floor(totalSeconds % 60);
  const m = Math.floor((totalSeconds / 60) % 60);
  const h = Math.floor(totalSeconds / 3600);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return totalSeconds > 3599
    ? `${h}:${pad(m)}:${pad(s)}`
    : `${pad(m)}:${pad(s)}`;
}

export function ClockPopup({
  gdkmonitor,
}: {
  gdkmonitor: Gdk.Monitor;
}) {
  let nameRef!: Gtk.Entry;
  let hoursRef!: Gtk.Entry;
  let minutesRef!: Gtk.Entry;
  let secondsRef!: Gtk.Entry;

  function submitTimer() {
    const h = Math.min(99, parseInt(hoursRef.get_text()) || 0);
    const m = Math.min(59, parseInt(minutesRef.get_text()) || 0);
    const s = Math.min(59, parseInt(secondsRef.get_text()) || 0);
    const ms = (h * 3600 + m * 60 + s) * 1000;
    if (ms === 0) return;
    createTimer(ms, nameRef.get_text() || 'timer');
    nameRef.set_text('');
    hoursRef.set_text('');
    minutesRef.set_text('');
    secondsRef.set_text('');
  }

  function makeTimeEntry(
    max: number,
    ref: (self: Gtk.Entry) => void,
    activate?: () => void
  ) {
    return (
      <Gtk.Entry
        placeholderText="00"
        widthChars={2}
        maxWidthChars={2}
        hexpand={false}
        onActivate={() => activate?.()}
        $={self => {
          const scroll = new Gtk.EventControllerScroll({
            flags: Gtk.EventControllerScrollFlags.VERTICAL,
          });
          scroll.connect(
            'scroll',
            (
              _: Gtk.EventControllerScroll,
              _dx: number,
              dy: number
            ) => {
              const cur = parseInt(self.get_text()) || 0;
              const next =
                (((cur - Math.round(dy)) % (max + 1)) + (max + 1)) %
                (max + 1);
              self.set_text(next.toString().padStart(2, '0'));
              return true;
            }
          );
          self.add_controller(scroll);
          self.connect('changed', () => {
            const stripped = self
              .get_text()
              .replace(/\D/g, '')
              .slice(0, 2);
            if (stripped !== self.get_text())
              setTimeout(() => self.set_text(stripped), 0);
          });
          ref(self);
        }}
      />
    );
  }

  return (
    <Popup
      gdkmonitor={gdkmonitor}
      name="clockPopup"
      visible={activePopup(a => a == 'clock')}
      margin={clockMargin}
      cssClass="clockOverlay">
      <box orientation={Gtk.Orientation.VERTICAL}>
        <box
          orientation={Gtk.Orientation.VERTICAL}
          visible={timers(t => t.length > 0)}>
          <For
            each={timers(t =>
              Array.from(
                { length: Math.ceil(t.length / 4) },
                (_, i) => i
              )
            )}>
            {(row: number) => (
              <box
                orientation={Gtk.Orientation.HORIZONTAL}
                halign={Gtk.Align.CENTER}>
                <For
                  each={timers(t => t.slice(row * 4, row * 4 + 4))}>
                  {(timer: Timer) => {
                    return (
                      <box
                        orientation={Gtk.Orientation.HORIZONTAL}
                        class="timer">
                        <box class="arc">
                          <Gtk.DrawingArea
                            widthRequest={60}
                            heightRequest={60}
                            $={self => {
                              self.set_draw_func((_, cr, w, h) => {
                                const percent =
                                  (timer.expires - +now()) /
                                  timer.length;
                                const cx = w / 2,
                                  cy = h / 2,
                                  r = 20;
                                cr.setLineWidth(6);
                                cr.setSourceRGBA(
                                  ...cssColor('subtext0', 0.11)
                                );
                                cr.arc(cx, cy, r, 0, 2 * Math.PI);
                                cr.stroke();
                                cr.setSourceRGBA(
                                  ...cssColor('fg', 0.7)
                                );
                                cr.arc(
                                  cx,
                                  cy,
                                  r,
                                  -Math.PI / 2,
                                  -Math.PI / 2 + 2 * Math.PI * percent
                                );
                                cr.stroke();
                              });
                              now.subscribe(() => self.queue_draw());
                            }}
                          />
                        </box>
                        <box
                          orientation={Gtk.Orientation.VERTICAL}
                          valign={Gtk.Align.CENTER}
                          class="label">
                          <label label={timer.name} />
                          <label
                            label={now(n =>
                              formatDuration(
                                Math.round(
                                  (timer.expires - +n) / 1000
                                )
                              )
                            )}
                          />
                        </box>
                      </box>
                    );
                  }}
                </For>
              </box>
            )}
          </For>
        </box>
        <box
          orientation={Gtk.Orientation.HORIZONTAL}
          class="timer"
          hexpand={false}
          halign={Gtk.Align.CENTER}>
          <box class="arc">
            <Gtk.DrawingArea
              widthRequest={60}
              heightRequest={60}
              $={self => {
                self.set_draw_func((_, cr, w, h) => {
                  const cx = w / 2,
                    cy = h / 2,
                    r = 20;
                  cr.setLineWidth(6);
                  cr.setSourceRGBA(...cssColor('subtext0', 0.11));
                  cr.arc(cx, cy, r, 0, 2 * Math.PI);
                  cr.stroke();
                  cr.setSourceRGBA(...cssColor('fg', 0.7));
                  cr.arc(cx, cy, r, -Math.PI / 2, (3 * Math.PI) / 2);
                  cr.stroke();
                });
              }}
            />
          </box>
          <box
            orientation={Gtk.Orientation.VERTICAL}
            valign={Gtk.Align.CENTER}
            class="label">
            <Gtk.Entry
              placeholderText="timer"
              widthChars={6}
              maxWidthChars={8}
              hexpand={false}
              onActivate={() => submitTimer()}
              $={self => (nameRef = self)}
            />
            <box orientation={Gtk.Orientation.HORIZONTAL}>
              {makeTimeEntry(99, self => (hoursRef = self))}
              <label label=":" />
              {makeTimeEntry(59, self => (minutesRef = self))}
              <label label=":" />
              {makeTimeEntry(
                59,
                self => (secondsRef = self),
                submitTimer
              )}
            </box>
          </box>
        </box>
      </box>
    </Popup>
  );
}
