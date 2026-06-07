import { createState } from 'ags';

export const [activePopup, setActivePopup] = createState<
  | 'wifi'
  | 'bluetooth'
  | 'battery'
  | 'volume'
  | 'arch'
  | 'player'
  | 'brightness'
  | 'launcher'
  | 'wallpaper'
  | 'app'
  | 'weather'
  | null
>(null);
