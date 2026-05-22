import { execAsync } from "ags/process"
import { Gdk } from "ags/gtk4"
import { title, artist, isPlaying } from "../polls.ts"

export function Player() {
  return (
    <button
      class="mpris noBg"
      $={(self) => self.set_cursor(Gdk.Cursor.new_from_name("pointer", null))}
      onClicked={() => execAsync("playerctl play-pause -p spotify")}
    >
      <box>
        <label class="icon" label={isPlaying((v) => (v ? "" : ""))} />
        <label label={title} /> - <label label={artist} /> (spotify){" "}
      </box>
    </button>
  )
}
