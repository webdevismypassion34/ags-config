export const formatNumber = (n: number): string => {
  if (n <= 999) return String(n);

  const format = (value: number, suffix: string) => {
    const str =
      value >= 100
        ? value.toFixed(0)
        : value >= 10
          ? value.toFixed(1)
          : value.toFixed(2);

    return `${Number(str)}${suffix}`; // removes trailing zeros
  };

  if (n < 1_000_000) {
    return format(n / 1_000, 'k');
  }

  return format(n / 1_000_000, 'm');
};

export const formatDate = (
  date: string | number | Date,
  mode: 'relative' | 'absolute' = 'absolute'
): string => {
  const d = new Date(date);

  if (mode === 'absolute') {
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  const diffSeconds = (d.getTime() - Date.now()) / 1000;
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 60 * 60 * 24 * 365],
    ['month', 60 * 60 * 24 * 30],
    ['week', 60 * 60 * 24 * 7],
    ['day', 60 * 60 * 24],
    ['hour', 60 * 60],
    ['minute', 60],
  ];

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  for (const [unit, secondsInUnit] of units) {
    if (Math.abs(diffSeconds) >= secondsInUnit) {
      return rtf.format(
        Math.round(diffSeconds / secondsInUnit),
        unit
      );
    }
  }

  return rtf.format(Math.round(diffSeconds), 'second');
};

export const formatBytes = (
  bytes: string | number, // Gb not GiB
  mode: 'pretty' | 'number' = 'pretty'
) => {
  // 100B 100Kb 100Mb 100Gb 100Tb 100Pb
  const letters = ['B', 'K', 'M', 'G', 'T', 'P'];
  if (typeof bytes === 'string') {
    const [, num, amt] = bytes.match(/^([\d.]+)([BKMGTP]?)$/)!;
    if (mode === 'pretty')
      return `${num}${amt}${amt !== 'B' ? 'b' : ''}`;
    else
      // I hope this works I never tested it!
      return (
        parseInt(num) * Math.pow(1024, letters.indexOf(amt) ?? 0)
      );
  } else {
    if (mode === 'number') return bytes;
    else {
      if (bytes === 0) return '0.00B';
      const threes = Math.floor(Math.log10(bytes) / 3);
      const amt = letters[threes];
      const num = (bytes / 1000 ** threes).toFixed(2);
      return `${num}${amt}${amt !== 'B' ? 'b' : ''}`;
    }
  }
};
