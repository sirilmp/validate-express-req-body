import { Request, Response, NextFunction } from "express";
interface ValidationRule {
    key: string;
    type: "string" | "number" | "boolean" | "array" | "object" | "email" | "custom-regex" | "custom-function";
    required?: boolean;
    min?: number;
    max?: number;
    regex?: RegExp;
    customValidator?: (value: any) => string | null;
}
declare const validateRequestBody: (rules: ValidationRule[]) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export default validateRequestBody;
