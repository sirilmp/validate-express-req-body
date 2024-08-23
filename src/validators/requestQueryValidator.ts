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

const requestQueryValidator = (rules: ValidationRule[]) => {
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
      let {
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

      types.forEach((t) => {
        if (!ALLOWED_TYPES.includes(t)) {
          errors.push(
            `${t} is not a valid type. Allowed types are ${ALLOWED_TYPES.join(
              ", "
            )}`
          );
          return;
        }
      });

      let value = getValueFromNestedObject(req.query, key);

      if (required && !isPresent(value)) {
        errors.push(`${key} is required`);
        return;
      }

      if (!isPresent(value)) return;

      if (type == "number") {
        value = Number(value);
        if (isNaN(value)) {
          errors.push(`${key} should be a valid number`);
          return;
        }
      }
      if (type == "array") {
        value = Array.isArray(value) ? value : [value];
      }

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

    req.query = validatedData;
    next();
    return;
  };
};

export default requestQueryValidator;
