export type BankType = 'chase' | 'bofa' | 'zelle' | 'general';

export interface ReceiptFields {
  bankType?: BankType;
  account?: string;
  amount: string;
  date?: string;
  time?: string;
  recipientName?: string;
  contactInfo?: string;
}

export interface AnalyzeReceiptResponse {
  success: boolean;
  fields?: ReceiptFields;
  bankName?: string;
  error?: string;
  rawText?: string;
}

export interface GenerateReceiptRequest {
  image: string; // base64 string or data URL
  fields: ReceiptFields;
}

export interface GenerateReceiptResponse {
  success: boolean;
  imageUrl?: string;
  promptUsed?: string;
  error?: string;
  isMock?: boolean;
}

export interface PresetReceipt {
  id: string;
  name: string;
  bank: string;
  imageUrl: string;
  fields: ReceiptFields;
}
