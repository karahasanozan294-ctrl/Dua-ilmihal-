export interface ZikirItem {
  id: string;
  title: string;
  arabic?: string;
  meaning?: string;
  target: number;
  count: number;
  rounds: number;
  isCustom?: boolean;
}

export interface ZikirState {
  items: ZikirItem[];
  activeId: string;
  dailyTotal: number;
  dailyDateKey: string;
  allTimeTotal: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  tesbihatChainEnabled: boolean;
}
