import { readFileAsync } from 'ags/file';
import { home } from '../polls';
import { createState } from 'ags';

const [cssVars, setCssVars] = createState<
  Record<string, string | number | number[]>
>({});
export default cssVars;

export function cssColor(
  key: string,
  alpha = 1
): [number, number, number, number] {
  const v = cssVars()['$' + key] as number[];
  return [v[0], v[1], v[2], v[3] ?? alpha];
}

const hexToNormalizedRGB = (hex: string) =>
  [16, 8, 0].map(s => ((parseInt(hex, 16) >> s) & 255) / 255);

const rgbToNormalizedRGB = (rgb: string) =>
  rgb.match(/[\d.]+/g)!.map((v, i) => Number(v) / (i < 3 ? 255 : 1));

const parseValue = (value: string) => {
  if (
    value.startsWith('#') &&
    (value.length == 4 ||
      value.length == 5 ||
      value.length == 7 ||
      value.length == 9)
  ) {
    const v = value.slice(1);
    // #abc => #aabbcc
    if (v.length == 3)
      return hexToNormalizedRGB(
        v[0] + v[0] + v[1] + v[1] + v[2] + v[2]
      );
    // #abcd ==> #aabbccdd
    if (v.length == 4)
      return hexToNormalizedRGB(
        v[0] + v[0] + v[1] + v[1] + v[2] + v[2]
      ).concat([parseInt(v[3] + v[3], 16) / 255]);
    // #abcdef
    if (v.length == 6) return hexToNormalizedRGB(v);
    // #abcdefab
    if (v.length == 8)
      return hexToNormalizedRGB(v).concat([
        parseInt(v[6] + v[7], 16) / 255,
      ]);
  } else if (value.startsWith('rgb')) {
    return rgbToNormalizedRGB(value);
  } else if (value.endsWith('px')) {
    return parseInt(value);
  } else if (value.endsWith('rem')) {
    return parseInt(value) * 16;
  } else {
    return value;
  }
};

readFileAsync(`${home}/.config/ags/style.scss`)
  .then(contents => {
    const lines = contents.split('\n');
    const parsed = lines
      .filter(line => line.startsWith('$'))
      .map(line => {
        const [key, value] = line
          .split(';')[0]
          .split(':')
          .map(e => e.trim());
        return [key, parseValue(value)];
      });

    return Object.fromEntries(parsed);
  })
  .then(setCssVars);
