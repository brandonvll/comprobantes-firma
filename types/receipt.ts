export type BankType = 'chase' | 'bofa' | 'zelle' | 'general' | string;

export type ReceiptFields = Record<string, string>;

export interface AnalyzeReceiptResponse {
  success: boolean;
  fields?: ReceiptFields;
  templateId?: string;
  error?: string;
  rawText?: string;
}

export interface GenerateReceiptRequest {
  image: string; // base64 string or data URL
  fields: ReceiptFields;
  templateId: string;
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
