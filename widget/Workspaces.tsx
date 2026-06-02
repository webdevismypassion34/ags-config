import { createPoll } from 'ags/time';
import { For } from 'ags';
import { execAsync } from 'ags/process';
import { Gdk } from 'ags/gtk4';

export function WorkspaceButtons({
  icons = {},
  blankInactive = false,
}: {
  icons?: Record<number, string>;
  blankInactive?: boolean;
}) {
  const workspaces = createPoll(
    [],
    1000,
    'hyprctl workspaces -j',
    out =>
      JSON.parse(out)
        .filter((ws: any) => ws.id > 0)
        .sort((ws: any, nextWs: any) => ws.id > nextWs.id)
  );

  const activeWorkspace = createPoll(
    { id: 0 } as any,
    200,
    'hyprctl activeworkspace -j',
    out => JSON.parse(out)
  );

  return (
    <box class="workspaces">
      <For each={workspaces}>
        {(ws: any) => (
          <button
            onClicked={() =>
              execAsync('hyprctl dispatch workspace ' + ws.id)
            }
            class={activeWorkspace(
              (aws: any) =>
                'workspace ' + (ws.id === aws.id ? 'selected' : '')
            )}
            $={self =>
              self.set_cursor(
                Gdk.Cursor.new_from_name('pointer', null)
              )
            }
            widthRequest={10}>
            <label
              label={activeWorkspace(aws =>
                !blankInactive || ws.id === aws.id
                  ? (icons[ws.id] ?? String(ws.id))
                  : ''
              )}
            />
          </button>
        )}
      </For>
    </box>
  );
}
