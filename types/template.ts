export interface TemplateField {
  id: string;
  label: string;
  type: 'text' | 'currency' | 'date' | 'time' | 'tel' | 'email';
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
}

export interface TemplateConfig {
  id: string;
  name: string;
  color: string; // Tailwind color class string or hex for UI tab styling
}

export interface ReceiptTemplate {
  config: TemplateConfig;
  fields: TemplateField[];
  
  /**
   * Generates the prompt required for OpenAI edit API based on the template fields.
   */
  buildPrompt: (fieldsData: Record<string, string>) => string;
  
  /**
   * Evaluates extracted OCR text and returns true if this template is a match.
   */
  detect: (rawText: string) => boolean;
  
  /**
   * Maps generic OCR JSON output from GPT-Vision into specific template fields.
   */
  mapFields: (extractedData: any) => Record<string, string>;
  
  /**
   * Renders the mock/fallback SVG representing the receipt.
   */
  mockSvg: (baseImageDataUrl: string, fieldsData: Record<string, string>) => string;
}
