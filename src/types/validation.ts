export const HTTP_STATUS_BAD_REQUEST = 400;

export const ALLOWED_TYPES = [
  "string",
  "number",
  "boolean",
  "array",
  "object",
  "email",
  "custom-regex",
  "custom-function",
];

export interface ValidationRule {
  key: string;
  type: string | string[];
  required?: boolean;
  min?: number | { [key: string]: number };
  max?: number | { [key: string]: number };
  regex?: RegExp;
  customValidator?: (value: any) => string | null;
}
