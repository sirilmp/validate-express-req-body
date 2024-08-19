import { Request, Response, NextFunction } from "express";
interface ValidationRule {
    key: string;
    type: string | string[];
    required?: boolean;
    min?: number | {
        [key: string]: number;
    };
    max?: number | {
        [key: string]: number;
    };
    regex?: RegExp;
    customValidator?: (value: any) => string | null;
}
declare const validateRequestBody: (rules: ValidationRule[]) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export default validateRequestBody;
