import { createState } from "ags"
import { execAsync } from "ags/process"
import { Gdk, Gtk } from "ags/gtk4"
import { title, artist, album, coverArt, isPlaying } from "../polls.ts"
import { startMargin } from "../utils/margin.ts"
import Popup from "../components/Popup.tsx"
import { activePopup, setActivePopup } from "../state.ts"
import Pango from "gi://Pango?version=1.0"
import Gio from "gi://Gio"

const [playerMargin, setPlayerMargin] = createState(0)

export function PlayerButton(_: { gdkmonitor: Gdk.Monitor }) {
  function togglePlayer() {
    if (activePopup() == "player") {
      setActivePopup(null)
    } else {
      setPlayerMargin(startMargin(playerButtonRef))
      setActivePopup("player")
    }
  }

  let playerButtonRef!: Gtk.Widget

  return (
    <button
      class="mpris noBg"
      $={(self) => {
        playerButtonRef = self
        self.set_cursor(Gdk.Cursor.new_from_name("pointer", null))
      }}
    >
      <box>
        <box>
          <label class="icon" label={isPlaying((v) => (v ? "" : ""))} />
          <Gtk.GestureClick
            button={1}
            onPressed={() => {
              execAsync("playerctl play-pause -p spotify")
            }}
          />
        </box>
        <box>
          <label label={title} /> - <label label={artist} /> (spotify){" "}
          <Gtk.GestureClick button={1} onPressed={togglePlayer} />
        </box>
      </box>
    </button>
  )
}

export function PlayerPopup({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
  return (
    <Popup
      gdkmonitor={gdkmonitor}
      name="playerPopup"
      visible={activePopup((a) => a == "player")}
      margin={playerMargin}
      cssClass="playerOverlay"
      halign={Gtk.Align.START}
      widthRequest={200}
    >
      <box
        class="title"
        orientation={Gtk.Orientation.VERTICAL}
        widthRequest={100}
      >
        <label
          label="Player"
          widthRequest={100}
          ellipsize={Pango.EllipsizeMode.END}
        />
      </box>
      <box
        orientation={Gtk.Orientation.HORIZONTAL}
        heightRequest={80}
        halign={Gtk.Align.CENTER}
        class="song"
      >
        {/* set widthRequest to 80 + margin! */}
        <overlay heightRequest={80} widthRequest={95} class="coverArt">
          <Gtk.Picture
            contentFit={Gtk.ContentFit.COVER}
            $type="overlay"
            css="border-radius: 5px;"
            $={(self) => {
              coverArt.subscribe(() => {
                const path = coverArt()
                if (path && path !== "none") {
                  setTimeout(
                    () => self.set_file(Gio.File.new_for_path(path)),
                    500,
                  )
                }
              })
            }}
          />
        </overlay>
        <box
          orientation={Gtk.Orientation.VERTICAL}
          halign={Gtk.Align.CENTER}
          valign={Gtk.Align.CENTER}
          class="songText"
        >
          <label class="primary" label={title} halign={Gtk.Align.CENTER} />
          <label class="secondary" label={artist} halign={Gtk.Align.CENTER} />
          <box
            class="controls"
            orientation={Gtk.Orientation.HORIZONTAL}
            halign={Gtk.Align.CENTER}
          >
            <label class="control" label="󰙣">
              <Gtk.GestureClick
                button={1}
                onPressed={() => {
                  execAsync("playerctl previous -p spotify")
                }}
              />
            </label>
            <label class="control" label={isPlaying((v) => (v ? "" : ""))}>
              <Gtk.GestureClick
                button={1}
                onPressed={() => {
                  execAsync("playerctl play-pause -p spotify")
                }}
              />
            </label>
            <label class="control" label="󰙡">
              <Gtk.GestureClick
                button={1}
                onPressed={() => {
                  execAsync("playerctl next -p spotify")
                }}
              />
            </label>
          </box>
        </box>
      </box>
    </Popup>
  )
}
