import { createState } from 'ags';

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

  setTimeout(() => {
    hideNotification(notif.id);
  }, 5000);
}

export function hideNotification(id: number) {
  if (notifications().findIndex(n => n.id === id) === -1)
    return console.log(
      `requested to hide ${id} but it was not found`
    );

  console.log('removed ');

  const clone = { ...visibleNotifications() };
  delete clone[id];
  setVisibleNotifications(clone);
  // setVisibleNotifications(notifications().filter(n => n.id !== id));
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
  // console.log('daemon started');
}
