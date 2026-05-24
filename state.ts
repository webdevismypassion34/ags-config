import { createState } from 'ags';

export const [activePopup, setActivePopup] = createState<
  | 'wifi'
  | 'bluetooth'
  | 'battery'
  | 'volume'
  | 'arch'
  | 'player'
  | 'launcher'
  | null
>(null);
