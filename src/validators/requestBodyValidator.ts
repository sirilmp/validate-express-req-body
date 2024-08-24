import { Request, Response, NextFunction } from "express";
import {
  HTTP_STATUS_BAD_REQUEST,
  ALLOWED_TYPES,
  ValidationRule,
} from "../types/validation";
import {
  isPresent,
  getValueFromNestedObject,
  validateValue,
  validateType,
} from "./utils";

const reqBody = (rules: ValidationRule[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];
    const validatedData: { [key: string]: any } = {};

    if (!rules || !Array.isArray(rules)) {
      errors.push("Validation rules are not properly defined.");
      return res.status(HTTP_STATUS_BAD_REQUEST).json({
        status: HTTP_STATUS_BAD_REQUEST,
        message: errors,
      });
    }

    rules.forEach((rule) => {
      const {
        key,
        type,
        required = false,
        min,
        max,
        regex,
        customValidator,
      } = rule;

      if (typeof key !== "string" || key.trim() === "") {
        errors.push(`Key "${key}" must be a non-empty string`);
        return;
      }

      const types = Array.isArray(type) ? type : [type];
      let validType = true;

      types.forEach((t) => {
        if (!ALLOWED_TYPES.includes(t)) {
          errors.push(
            `${t} is not a valid type. Allowed types are ${ALLOWED_TYPES.join(", ")}`
          );
          validType = false;
        }
      });

      // Skip further validation if any type is invalid
      if (!validType) return;

      const value = getValueFromNestedObject(req.body, key);

      if (required && !isPresent(value)) {
        errors.push(`${key} is required`);
        return;
      }

      if (!isPresent(value)) return;

      if (!validateType(key, value, types, errors)) return;

      validateValue(
        key,
        value,
        types,
        { min, max, regex, customValidator },
        errors,
        validatedData
      );
    });

    if (errors.length > 0) {
      return res.status(HTTP_STATUS_BAD_REQUEST).json({
        status: HTTP_STATUS_BAD_REQUEST,
        message: errors,
      });
    }

    req.body = validatedData;
    next();
  };
};

export default reqBody;
