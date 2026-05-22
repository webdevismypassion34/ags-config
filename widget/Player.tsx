import { createState } from "ags"
import { execAsync } from "ags/process"
import { Gdk, Gtk } from "ags/gtk4"
import { title, artist, isPlaying } from "../polls.ts"
import { centeredMargin } from "../utils/margin.ts"
import Popup from "../components/Popup.tsx"
import { activePopup, setActivePopup } from "../state.ts"

const [playerMargin, setPlayerMargin] = createState(0)

export function PlayerButton({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
  function togglePlayer() {
    if (activePopup() == "player") {
      setActivePopup(null)
    } else {
      setPlayerMargin(centeredMargin(playerButtonRef, gdkmonitor))
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
      onClicked={togglePlayer}
    >
      <Gtk.GestureClick
        button={3}
        onPressed={() => {
          execAsync("playerctl play-pause -p spotify")
        }}
      />
      <box>
        <label class="icon" label={isPlaying((v) => (v ? "" : ""))} />
        <label label={title} /> - <label label={artist} /> (spotify){" "}
      </box>
    </button>
  )
}

export function PlayerPopup({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
  return (
    <Popup
      gdkmonitor={gdkmonitor}
      name="volumePopup"
      visible={activePopup((a) => a == "player")}
      margin={playerMargin}
      cssClass="playerOverlay"
      widthRequest={175}
    >
      <box class="title" orientation={Gtk.Orientation.VERTICAL}>
        <label label="Player" />
      </box>
    </Popup>
  )
}
