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
            if (!ALLOWED_TYPES.includes(type)) {
                errors.push(`${type} is not a valid type. Allowed types are ${ALLOWED_TYPES}`);
                return;
            }
            const value = getValueFromNestedObject(req.body, key);
            if (required && !isPresent(value)) {
                errors.push(`${key} is required`);
                return;
            }
            if (!isPresent(value))
                return;
            if (!validateType(key, value, type, errors))
                return;
            validateValue(key, value, type, { min, max, regex, customValidator }, errors, validatedData);
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
const validateType = (key, value, type, errors) => {
    var _a;
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
    if (!((_a = typeValidators[type]) === null || _a === void 0 ? void 0 : _a.call(typeValidators, value))) {
        errors.push(`${key} should be a valid ${type}`);
        return false;
    }
    return true;
};
const validateValue = (key, value, type, { min, max, regex, customValidator }, errors, validatedData) => {
    if ((type === "string" || type === "array") &&
        min !== undefined &&
        value.length < min) {
        const message = type === "string"
            ? `${key} should have at least ${min} characters`
            : `${key} should have at least ${min} items`;
        errors.push(message);
    }
    if ((type === "string" || type === "array") &&
        max !== undefined &&
        value.length > max) {
        const message = type === "string"
            ? `${key} should have at most ${max} characters`
            : `${key} should have at most ${max} items`;
        errors.push(message);
    }
    if (type === "number" && min !== undefined && value < min) {
        errors.push(`${key} should be at least ${min}`);
    }
    if (type === "number" && max !== undefined && value > max) {
        errors.push(`${key} should be at most ${max}`);
    }
    if (type === "custom-regex" && regex && !regex.test(value)) {
        errors.push(`${key} is invalid`);
    }
    if (customValidator && typeof customValidator === "function") {
        const customError = customValidator(value);
        if (customError) {
            errors.push(customError);
        }
    }
    if (!errors.length) {
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
export default validateRequestBody;
