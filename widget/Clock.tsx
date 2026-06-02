import { createState } from 'ags';

const [now, setNow] = createState(new Date());

setTimeout(
  () => {
    setNow(new Date());
    setInterval(() => setNow(new Date()), 60000);
  },
  60000 - (Date.now() % 60000)
);

export function Clock({
  hour12 = false,
  showDate = true,
}: {
  hour12?: boolean;
  showDate?: boolean;
}) {
  const label = now(d => {
    const time = d.toLocaleTimeString('en-US', { hour12, timeStyle: 'short' });
    if (!showDate) return time;
    const date = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
    return `${time} ${date}`;
  });

  return <button class="clock" label={label} />;
}
