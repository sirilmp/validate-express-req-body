// import { Request, Response, NextFunction } from "express";

// const HTTP_STATUS_BAD_REQUEST = 400;

// const ALLOWED_TYPES = [
//   "string",
//   "number",
//   "boolean",
//   "array",
//   "object",
//   "email",
//   "custom-regex",
//   "custom-function",
// ];

// interface ValidationRule {
//   key: string;
//   type: string | string[];
//   required?: boolean;
//   min?: number | { [key: string]: number };
//   max?: number | { [key: string]: number };
//   regex?: RegExp;
//   customValidator?: (value: any) => string | null;
// }

// const validateRequestBody = (rules: ValidationRule[]) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     const errors: string[] = [];
//     const validatedData: { [key: string]: any } = {};

//     if (!rules || !Array.isArray(rules)) {
//       errors.push('Validation rules are not properly defined.');
//       return res.status(HTTP_STATUS_BAD_REQUEST).json({
//         status: HTTP_STATUS_BAD_REQUEST,
//         message: errors,
//       });
//     }

//     rules.forEach((rule) => {
//       const {
//         key,
//         type,
//         required = false,
//         min,
//         max,
//         regex,
//         customValidator,
//       } = rule;

//       // Validate key is a non-empty string
//       if (typeof key !== "string" || key.trim() === "") {
//         errors.push(`Key "${key}" must be a non-empty string`);
//         return;
//       }

//       const types = Array.isArray(type) ? type : [type];

//       // Validate allowed types
//       types.forEach((t) => {
//         if (!ALLOWED_TYPES.includes(t)) {
//           errors.push(`${t} is not a valid type. Allowed types are ${ALLOWED_TYPES.join(", ")}`);
//           return;
//         }
//       });

//       const value = getValueFromNestedObject(req.body, key);

//       if (required && !isPresent(value)) {
//         errors.push(`${key} is required`);
//         return;
//       }

//       if (!isPresent(value)) return;

//       if (!validateType(key, value, types, errors)) return;

//       validateValue(
//         key,
//         value,
//         types,
//         { min, max, regex, customValidator },
//         errors,
//         validatedData
//       );
//     });

//     if (errors.length > 0) {
//       return res.status(HTTP_STATUS_BAD_REQUEST).json({
//         status: HTTP_STATUS_BAD_REQUEST,
//         message: errors,
//       });
//     }

//     req.body = validatedData;
//     next();
//   };
// };

// const isPresent = (value: any): boolean =>
//   value !== undefined && value !== null && value !== "";

// const getValueFromNestedObject = (obj: any, path: string) => {
//   const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
//   let result = obj;
//   for (const key of keys) {
//     result = result ? result[key] : undefined;
//   }
//   return result;
// };

// const validateType = (
//   key: string,
//   value: any,
//   types: string[],
//   errors: string[]
// ): boolean => {
//   const typeValidators: { [key: string]: (val: any) => boolean } = {
//     string: (val: any) => typeof val === "string",
//     number: (val: any) => typeof val === "number",
//     boolean: (val: any) => typeof val === "boolean",
//     array: (val: any) => Array.isArray(val),
//     object: (val: any) => typeof val === "object" && !Array.isArray(val),
//     email: (val: any) =>
//       typeof val === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
//     "custom-regex": () => true,
//     "custom-function": () => true,
//   };

//   const isValid = types.some((t) => typeValidators[t]?.(value));

//   if (!isValid) {
//     errors.push(`${key} should be a valid ${types.join(" or ")}`);
//     return false;
//   }

//   return true;
// };

// const validateValue = (
//   key: string,
//   value: any,
//   types: string[],
//   { min, max, regex, customValidator }: Partial<ValidationRule>,
//   errors: string[],
//   validatedData: { [key: string]: any }
// ) => {
//   let isValid = true;

//   types.forEach((type) => {
//     const minValue = typeof min === "number" ? min : min?.[type];
//     const maxValue = typeof max === "number" ? max : max?.[type];

//     if (minValue !== undefined && (typeof minValue !== "number" || minValue < 0)) {
//       errors.push(`Minimum value for ${key} must be a non-negative number`);
//       isValid = false;
//     }

//     if (maxValue !== undefined && (typeof maxValue !== "number" || maxValue < 0)) {
//       errors.push(`Maximum value for ${key} must be a non-negative number`);
//       isValid = false;
//     }

//     if (type === "string" && typeof value === "string") {
//       if (minValue !== undefined && value.length < minValue) {
//         errors.push(`${key} type is ${type}, it should be at least ${minValue} characters`);
//         isValid = false;
//       }
//       if (maxValue !== undefined && value.length > maxValue) {
//         errors.push(`${key} type is ${type}, it should be at most ${maxValue} characters`);
//         isValid = false;
//       }
//     }

//     if (type === "number" && typeof value === "number") {
//       if (minValue !== undefined && value < minValue) {
//         errors.push(`${key} type is ${type}, it should be at least ${minValue}`);
//         isValid = false;
//       }
//       if (maxValue !== undefined && value > maxValue) {
//         errors.push(`${key} type is ${type}, it should be at most ${maxValue}`);
//         isValid = false;
//       }
//     }

//     if (type === "array" && Array.isArray(value)) {
//       if (minValue !== undefined && value.length < minValue) {
//         errors.push(`${key} type is ${type}, it should be at least ${minValue} items`);
//         isValid = false;
//       }
//       if (maxValue !== undefined && value.length > maxValue) {
//         errors.push(`${key} type is ${type}, it should be at most ${maxValue} items`);
//         isValid = false;
//       }
//     }
//   });

//   if (isValid && types.includes("custom-regex") && regex && !regex.test(value)) {
//     errors.push(`${key} is invalid`);
//     isValid = false;
//   }

//   if (isValid && customValidator && typeof customValidator === "function") {
//     const customError = customValidator(value);
//     if (customError) {
//       errors.push(customError);
//       isValid = false;
//     }
//   }

//   if (isValid && errors.length === 0) {
//     setValueInNestedObject(validatedData, key, value);
//   }
// };

// const setValueInNestedObject = (obj: any, path: string, value: any) => {
//   const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
//   let current = obj;
//   for (let i = 0; i < keys.length - 1; i++) {
//     const key = keys[i];
//     if (!current[key]) {
//       current[key] = isNaN(Number(keys[i + 1])) ? {} : [];
//     }
//     current = current[key];
//   }
//   current[keys[keys.length - 1]] = value;
// };

// export default validateRequestBody;

export * from './validators';

