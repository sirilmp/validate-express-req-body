import { ValidationRule } from "../types/validation";

export const isPresent = (value: any): boolean =>
  value !== undefined && value !== null && value !== "";

export const getValueFromNestedObject = (obj: any, path: string) => {
  const keys = path.replace(/\[(\d+)\]/g, ".$1").split(".");
  let result = obj;
  for (const key of keys) {
    result = result ? result[key] : undefined;
  }
  return result;
};

export const validateValue = (
  key: string,
  value: any,
  types: string[],
  { min, max, regex, customValidator }: Partial<ValidationRule>,
  errors: string[],
  validatedData: { [key: string]: any }
) => {
  let isValid = true;

  types.forEach((type) => {
    const minValue = typeof min === "number" ? min : min?.[type];
    const maxValue = typeof max === "number" ? max : max?.[type];

    if (
      minValue !== undefined &&
      (typeof minValue !== "number" || minValue < 0)
    ) {
      errors.push(`Minimum value for ${key} must be a non-negative number`);
      isValid = false;
    }

    if (
      maxValue !== undefined &&
      (typeof maxValue !== "number" || maxValue < 0)
    ) {
      errors.push(`Maximum value for ${key} must be a non-negative number`);
      isValid = false;
    }

    if (type === "string" && typeof value === "string") {
      if (minValue !== undefined && value.length < minValue) {
        errors.push(
          `${key} type is ${type}, it should be at least ${minValue} characters`
        );
        isValid = false;
      }
      if (maxValue !== undefined && value.length > maxValue) {
        errors.push(
          `${key} type is ${type}, it should be at most ${maxValue} characters`
        );
        isValid = false;
      }
    }

    if (type === "number" && typeof value === "number") {
      if (minValue !== undefined && value < minValue) {
        errors.push(
          `${key} type is ${type}, it should be at least ${minValue}`
        );
        isValid = false;
      }
      if (maxValue !== undefined && value > maxValue) {
        errors.push(`${key} type is ${type}, it should be at most ${maxValue}`);
        isValid = false;
      }
    }

    if (type === "array" && Array.isArray(value)) {
      if (minValue !== undefined && value.length < minValue) {
        errors.push(
          `${key} type is ${type}, it should be at least ${minValue} items`
        );
        isValid = false;
      }
      if (maxValue !== undefined && value.length > maxValue) {
        errors.push(
          `${key} type is ${type}, it should be at most ${maxValue} items`
        );
        isValid = false;
      }
    }
  });

  if (
    isValid &&
    types.includes("custom-regex") &&
    regex &&
    !regex.test(value)
  ) {
    errors.push(`${key} is invalid`);
    isValid = false;
  }

  if (isValid && customValidator && typeof customValidator === "function") {
    const customError = customValidator(value);
    if (customError) {
      errors.push(customError);
      isValid = false;
    }
  }

  if (isValid && errors.length === 0) {
    setValueInNestedObject(validatedData, key, value);
  }
};

export const validateType = (
  key: string,
  value: any,
  types: string[],
  errors: string[]
): boolean => {
  const typeValidators: { [key: string]: (val: any) => boolean } = {
    string: (val: any) => typeof val === "string",
    number: (val: any) => typeof val === "number",
    boolean: (val: any) => typeof val === "boolean",
    array: (val: any) => Array.isArray(val),
    object: (val: any) => typeof val === "object" && !Array.isArray(val),
    email: (val: any) =>
      typeof val === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    url: (val: any) => isValidURL(val),
    "custom-regex": () => true,
    "custom-function": () => true,
  };

  const isValid = types.some((t) => typeValidators[t]?.(value));

  if (!isValid) {
    errors.push(`${key} should be a valid ${types.join(" or ")}`);
    return false;
  }

  return true;
};

export const setValueInNestedObject = (obj: any, path: string, value: any) => {
  const keys = path.replace(/\[(\d+)\]/g, ".$1").split(".");
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current[key]) {
      current[key] = isNaN(Number(keys[i + 1])) ? {} : [];
    }
    current = current[key];
  }
  current[keys[keys.length - 1]] = value;
};

export const convertToArray = (
  value: string | number | string[]
): (string | number)[] => {
  // Helper function to parse a value
  const parseValue = (item: string): string | number => {
    const trimmedItem = item.trim();
    // Attempt to convert to number
    const parsedNumber = Number(trimmedItem);
    return isNaN(parsedNumber) ? trimmedItem : parsedNumber;
  };

  // If value is a string
  if (typeof value === "string") {
    // Remove surrounding brackets if present
    const trimmedValue = value.trim();
    const hasBrackets =
      trimmedValue.startsWith("[") && trimmedValue.endsWith("]");
    const content = hasBrackets ? trimmedValue.slice(1, -1) : trimmedValue;

    // Split by commas and parse each element
    return content.split(",").map(parseValue);
  }

  // If value is already an array
  if (Array.isArray(value)) {
    return value.map((item) =>
      typeof item === "string" ? parseValue(item) : item
    );
  }

  // Wrap single value in an array and convert to string or number
  return [parseValue(value.toString())];
};

export const isValidURL = (urlString: string): boolean => {
  try {
    new URL(urlString);
    return true;
  } catch {
    return false;
  }
};
