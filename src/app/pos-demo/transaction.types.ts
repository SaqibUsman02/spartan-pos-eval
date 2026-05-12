export type TransactionStatus = 'paid' | 'open' | 'refunded';

export interface LineItem {
  readonly name: string;
  readonly quantity: number;
  readonly lineTotal: number;
}

/** One line on the receipt / tab summary — dummy POS transaction row */
export interface PosTransaction {
  id: string;
  tabLabel: string;
  /** Internal tab / order id staff might search */
  tabInternalId: string;
  totalAmount: number;
  currency: string;
  status: TransactionStatus;
  startedAt: string;
  /** When the tab was settled; null while still open */
  closedAt: string | null;
  guestCount: number;
  cashierName: string;
  /** Floor / zone for table map */
  section: string;
  paymentMethod: string | null;
  terminalId: string;
  notes: string | null;
  lineItems: readonly LineItem[];
}
