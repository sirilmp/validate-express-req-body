"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HTTP_STATUS_BAD_REQUEST = 400;
const ALLOWED_TYPES = [
    "string",
    "number",
    "boolean",
    "array",
    "object",
    "email",
    "custom-regex",
    "custom-function",
];
const validateRequestBody = (rules) => {
    return (req, res, next) => {
        const errors = [];
        const validatedData = {};
        if (!rules || !Array.isArray(rules)) {
            errors.push('Validation rules are not properly defined.');
            return res.status(HTTP_STATUS_BAD_REQUEST).json({
                status: HTTP_STATUS_BAD_REQUEST,
                message: errors,
            });
        }
        rules.forEach((rule) => {
            const { key, type, required = false, min, max, regex, customValidator, } = rule;
            const types = Array.isArray(type) ? type : [type];
            types.forEach((t) => {
                if (!ALLOWED_TYPES.includes(t)) {
                    errors.push(`${t} is not a valid type. Allowed types are ${ALLOWED_TYPES.join(", ")}`);
                    return;
                }
            });
            const value = getValueFromNestedObject(req.body, key);
            if (required && !isPresent(value)) {
                errors.push(`${key} is required`);
                return;
            }
            if (!isPresent(value))
                return;
            if (!validateType(key, value, types, errors))
                return;
            validateValue(key, value, types, { min, max, regex, customValidator }, errors, validatedData);
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
const isPresent = (value) => value !== undefined && value !== null && value !== "";
const getValueFromNestedObject = (obj, path) => {
    const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
    let result = obj;
    for (const key of keys) {
        result = result ? result[key] : undefined;
    }
    return result;
};
const validateType = (key, value, types, errors) => {
    const typeValidators = {
        string: (val) => typeof val === "string",
        number: (val) => typeof val === "number",
        boolean: (val) => typeof val === "boolean",
        array: (val) => Array.isArray(val),
        object: (val) => typeof val === "object" && !Array.isArray(val),
        email: (val) => typeof val === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
        "custom-regex": () => true,
        "custom-function": () => true,
    };
    const isValid = types.some((t) => { var _a; return (_a = typeValidators[t]) === null || _a === void 0 ? void 0 : _a.call(typeValidators, value); });
    if (!isValid) {
        errors.push(`${key} should be a valid ${types.join(" or ")}`);
        return false;
    }
    return true;
};
const validateValue = (key, value, types, { min, max, regex, customValidator }, errors, validatedData) => {
    let isValid = true;
    types.forEach((type) => {
        const minValue = typeof min === "number" ? min : min === null || min === void 0 ? void 0 : min[type];
        const maxValue = typeof max === "number" ? max : max === null || max === void 0 ? void 0 : max[type];
        if (type === "string" &&
            typeof value === "string") {
            if (minValue !== undefined && value.length < minValue) {
                errors.push(`${key} type is ${type}, it should be at least ${minValue} characters`);
                isValid = false;
            }
            if (maxValue !== undefined && value.length > maxValue) {
                errors.push(`${key} type is ${type}, it should be at most ${maxValue} characters`);
                isValid = false;
            }
        }
        if (type === "number" &&
            typeof value === "number") {
            if (minValue !== undefined && value < minValue) {
                errors.push(`${key} type is ${type}, it should be at least ${minValue}`);
                isValid = false;
            }
            if (maxValue !== undefined && value > maxValue) {
                errors.push(`${key} type is ${type}, it should be at most ${maxValue}`);
                isValid = false;
            }
        }
        if (type === "array" && Array.isArray(value)) {
            if (minValue !== undefined && value.length < minValue) {
                errors.push(`${key} type is ${type}, it should be at least ${minValue} items`);
                isValid = false;
            }
            if (maxValue !== undefined && value.length > maxValue) {
                errors.push(`${key} type is ${type}, it should be at most ${maxValue} items`);
                isValid = false;
            }
        }
    });
    if (isValid && types.includes("custom-regex") && regex && !regex.test(value)) {
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
const setValueInNestedObject = (obj, path, value) => {
    const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
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
module.exports = validateRequestBody;
