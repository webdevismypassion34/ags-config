import { createState } from 'ags';

export type Timer = {
  id: number;
  name: string;
  length: number; // ms
  expires: number;
  paused: boolean;
  pausedSince: number; // when timer is unpaused, add `Date.now() - pausedSince` to expires,
  timeout: ReturnType<typeof setTimeout>;
};

const [timers, setTimers] = createState<Timer[]>([]);
const [currentTimer, setCurrentTimer] = createState<Timer | null>(
  null
);
let counter = 0;

function createTimer(length: number, name: string = 'timer') {
  const timer: Timer = {
    id: counter++,
    name,
    length,
    expires: Date.now() + length,
    paused: false,
    pausedSince: 0,
    timeout: setTimeout(() => {
      callTimer(timer.id);
    }, length),
  };

  setTimers([...timers(), timer]);
}

function pauseTimer(id: number) {
  const timer = timers().find(t => t.id === id);
  if (!timer) return;

  if (timer.paused) {
    timer.paused = false;
    timer.expires += Date.now() - timer.pausedSince;
    timer.timeout = setTimeout(() => {
      callTimer(timer.id);
    }, timer.expires - Date.now());
  } else {
    timer.paused = true;
    timer.pausedSince = Date.now();
    clearTimeout(timer.timeout);
  }

  setTimers([...timers()]);
}

function callTimer(id: number) {
  console.log(`timer went off: ${id}`);

  const timer = timers().find(t => t.id === id);
  if (!timer) return;

  setCurrentTimer(timer);
  setTimers(timers().filter(t => t.id !== id));
}

function deleteTimer(id: number) {
  const timer = timers().find(t => t.id === id);
  if (!timer) {
    if (currentTimer()?.id === id) {
      setCurrentTimer(null);
    }
    return;
  }

  clearTimeout(timer.timeout);
  setTimers(timers().filter(t => t.id !== id));
}

export { timers, currentTimer, createTimer, pauseTimer, deleteTimer };

createTimer(450000)
