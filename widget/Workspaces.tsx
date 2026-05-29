import { createPoll } from 'ags/time';
import { For } from 'ags';
import { execAsync } from 'ags/process';
import { Gdk } from 'ags/gtk4';

export function WorkspaceButtons({
  icons = {},
}: {
  icons?: Record<number, string>;
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
    <box>
      <For each={workspaces}>
        {(ws: any) => (
          <button
            label={icons[ws.id] ?? String(ws.id)}
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
            widthRequest={10}
          />
        )}
      </For>
    </box>
  );
}
