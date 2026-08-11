import { chaseTemplate } from './chase';
import { bofaTemplate } from './bofa';
import { zelleTemplate } from './zelle';
import { ReceiptTemplate } from '@/types/template';

// Registry of all available receipt templates
export const templates: Record<string, ReceiptTemplate> = {
  chase: chaseTemplate,
  bofa: bofaTemplate,
  zelle: zelleTemplate,
};

// Helper to get array of templates for iteration (e.g. in UI)
export const getTemplateList = () => Object.values(templates);

// Helper to find template by OCR text
export const detectTemplate = (rawText: string): ReceiptTemplate | null => {
  for (const template of getTemplateList()) {
    if (template.detect(rawText)) {
      return template;
    }
  }
  return null;
};
