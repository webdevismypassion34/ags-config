import { createState, createComputed } from "ags"
import { execAsync } from "ags/process"
import { Gtk, Gdk } from "ags/gtk4"
import {
  volume,
  volumeMuted,
  input,
  inputMuted,
  appsUsingMic,
} from "../polls.ts"
import { centeredMargin } from "../utils/margin.ts"
import Popup from "../components/Popup.tsx"
import { activePopup, setActivePopup } from "../state.ts"

const [volumeMargin, setVolumeMargin] = createState(0)

export function VolumeButton({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
  function toggleVolume() {
    if (activePopup() == "volume") {
      setActivePopup(null)
    } else {
      setVolumeMargin(centeredMargin(volumeButtonRef, gdkmonitor))
      setActivePopup("volume")
    }
  }

  const volumeIcon = createComputed(() => {
    if (parseInt(volume()) == 0) {
      return "󰝟"
    } else {
      return "󰕾"
    }
  })

  let volumeButtonRef!: Gtk.Widget

  return (
    <button
      $={(self) => {
        volumeButtonRef = self
        self.set_cursor(Gdk.Cursor.new_from_name("pointer", null))
      }}
      class="volume"
      onClicked={toggleVolume}
    >
      <box>
        <label label={volumeIcon} class="icon" />
        <label label={volume} />
      </box>
    </button>
  )
}

export function VolumePopup({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
  return (
    <Popup
      gdkmonitor={gdkmonitor}
      name="volumePopup"
      visible={activePopup((a) => a == "volume")}
      margin={volumeMargin}
      cssClass="volumeOverlay"
      widthRequest={175}
    >
      <box class="title" orientation={Gtk.Orientation.VERTICAL}>
        <label label="Sound" />
      </box>
      <box orientation={Gtk.Orientation.HORIZONTAL} halign={Gtk.Align.CENTER}>
        <box orientation={Gtk.Orientation.VERTICAL}>
          <Gtk.Scale
            orientation={Gtk.Orientation.VERTICAL}
            heightRequest={200}
            sensitive={volumeMuted((v) => !v)}
            $={(self) => {
              volume.subscribe(() => {
                self.get_adjustment().set_value(parseInt(volume()) || 0)
              })
            }}
            adjustment={
              new Gtk.Adjustment({
                lower: 0,
                upper: 100,
                value: parseInt(volume()) || 0,
                step_increment: 1,
              })
            }
            onValueChanged={(self) => {
              execAsync(
                `wpctl set-volume @DEFAULT_SINK@ ${self.get_value() / 100}`,
              )
            }}
          />
          <button
            class="muteToggle"
            $={(self) =>
              self.set_cursor(Gdk.Cursor.new_from_name("pointer", null))
            }
            onClicked={() => execAsync("wpctl set-mute @DEFAULT_SINK@ toggle")}
          >
            <label label="vol" />
          </button>
        </box>
        <box orientation={Gtk.Orientation.VERTICAL}>
          <Gtk.Scale
            orientation={Gtk.Orientation.VERTICAL}
            heightRequest={200}
            sensitive={inputMuted((v) => !v)}
            $={(self) => {
              input.subscribe(() => {
                self.get_adjustment().set_value(parseInt(input()) || 0)
              })
            }}
            adjustment={
              new Gtk.Adjustment({
                lower: 0,
                upper: 100,
                value: parseInt(input()) || 0,
                step_increment: 1,
              })
            }
            onValueChanged={(self) => {
              execAsync(
                `wpctl set-volume @DEFAULT_SOURCE@ ${self.get_value() / 100}`,
              )
            }}
          />
          <button
            class="muteToggle"
            $={(self) =>
              self.set_cursor(Gdk.Cursor.new_from_name("pointer", null))
            }
            onClicked={() =>
              execAsync("wpctl set-mute @DEFAULT_SOURCE@ toggle")
            }
          >
            <label label="mic" />
          </button>
        </box>
      </box>
      <label
        wrap={true}
        maxWidthChars={20}
        label={appsUsingMic((apps) =>
          apps.length ? apps.join(", ") + " is using mic" : "",
        )}
      />
    </Popup>
  )
}
