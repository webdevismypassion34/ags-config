import { createState } from 'ags';
import AstalNotifd from 'gi://AstalNotifd?version=0.1';

const timeouts: Record<string, ReturnType<typeof setTimeout>> = {};

export type NotificationAction = {
  key: string;
  label: string;
};

export type NotificationHints = {
  urgency?: 0 | 1 | 2; // low, normal, critical
  category?: string;
  'desktop-entry'?: string;
  'image-path'?: string;
  'sound-name'?: string;
  'sound-file'?: string;
  transient?: boolean;
  resident?: boolean;
  'suppress-sound'?: boolean;
  [hint: string]: unknown;
};

export type NotificationReceived = {
  id: number;
  replacesId: number;
  appName: string;
  appIcon: string;
  summary: string;
  body: string;
  actions: NotificationAction[];
  hints: NotificationHints;
  expireTimeout: number;
  time: number;
};

const [notifications, setNotifications] = createState<
  NotificationReceived[]
>([]);
const [visibleNotifications, setVisibleNotifications] = createState<
  Record<number, NotificationReceived>
>([]);

export { notifications, visibleNotifications };

function handleNotification(notif: NotificationReceived) {
  setNotifications([...notifications(), notif]);

  const clone = { ...visibleNotifications() };
  clone[notif.id] = notif;
  setVisibleNotifications(clone);

  // console.log(notifications());

  timeouts[notif.id] = setTimeout(() => {
    hideNotification(notif.id);
  }, 5000);
}

export function hideNotification(id: number) {
  if (notifications().findIndex(n => n.id === id) === -1)
    return console.log(
      `requested to hide ${id} but it was not found`
    );

  const clone = { ...visibleNotifications() };
  delete clone[id];
  setVisibleNotifications(clone);
  clearTimeout(timeouts[id]);
  delete timeouts[id];
}

export function deleteNotification(id: number) {
  const i = notifications().findIndex(n => n.id === id);
  if (i === -1)
    return console.log(
      `requested to hide ${id} but it was not found`
    );

  const clone = [...notifications()];
  clone.splice(i, 1);
  setNotifications(clone);
}

export function invokeAction(id: number, actionId: string) {
  AstalNotifd.get_default().get_notification(id)?.invoke(actionId);
}

function testNotif() {
  handleNotification({
    id: Math.floor(Math.random() * 1000000),
    replacesId: 0,
    appName: 'Discord',
    appIcon: 'bleh',
    summary: 'test message',
    body: 'Lorem ipsum something something',
    actions: [
      { key: 'default', label: 'Open' },
      { key: 'mark-read', label: 'Mark as Read' },
    ],
    hints: {
      urgency: 1,
      category: 'im.received',
      'desktop-entry': 'vesktop',
      transient: false,
      resident: true,
    },
    expireTimeout: -1,
    time: Date.now(),
  });
}

// testNotif();
// testNotif();
// setTimeout(testNotif, 2000);
// setTimeout(testNotif, 2000);
// setTimeout(testNotif, 2100);

export function startDaemon() {
  const notifd = AstalNotifd.get_default();

  notifd.connect('notified', (_, id, replaced) => {
    const n = notifd.get_notification(id);
    if (!n) return;

    handleNotification({
      id: n.id,
      replacesId: replaced ? n.id : 0,
      appName: n.appName,
      appIcon: n.appIcon,
      summary: n.summary,
      body: n.body,
      actions: n.actions.map(a => ({ key: a.id, label: a.label })),
      hints: {
        urgency: n.urgency as unknown as 0 | 1 | 2,
        category: n.category,
        'desktop-entry': n.desktopEntry,
        'image-path': n.image,
        'sound-name': n.soundName,
        'sound-file': n.soundFile,
        'suppress-sound': n.suppressSound,
        transient: n.transient,
        resident: n.resident,
      },
      expireTimeout: n.expireTimeout,
      time: n.time,
    });
  });

  notifd.connect('resolved', (_, id) => {
    hideNotification(id);
  });
}
