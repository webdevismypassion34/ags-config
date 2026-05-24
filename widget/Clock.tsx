import { createState } from 'ags';

const [clock, setClock] = createState('now');

function updateTime() {
  const now = new Date();
  setClock(
    now.toLocaleTimeString('pl-PL', {
      hour12: false,
      timeStyle: 'short',
    }) +
      ' ' +
      now.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
      })
  );
}

updateTime();
setTimeout(
  () => {
    updateTime();
    setInterval(updateTime, 60000);
  },
  60000 - (Date.now() % 60000)
);

export function Clock() {
  return <label label={clock} />;
}
