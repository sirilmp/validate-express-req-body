# Express Request Body Validator Middleware

This package provides a flexible middleware for validating the request body in Express applications. It allows you to define validation rules for different data types, including custom validation functions and regular expressions.

## Installation

To install the package, you can use npm or yarn:

```bash
npm install  validate-express-req-body
```

or

```bash
yarn add  validate-express-req-body
```

## Usage

### Basic Example

First, require the middleware in your Express application:

```javascript
//index.js

const express = require("express");
const validateRequestBody = require("validate-express-req-body");
const createUserRules = require("../rules/create-user.rules");

const app = express();
app.use(express.json());

app.post("/create-user", validateRequestBody(createUserRules), (req, res) => {
  res.send("Request is valid!");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
```

```javascript
//create-user.rules.js

module.exports = [
  {
    key: "email",
    type: "email",
    required: true,
  },
  {
    key: "first_name",
    type: "string",
    required: true,
    min: 5,
    max: 15,
  },
  {
    key: "last_name",
    type: "string",
    required: false,
    min: 5,
    max: 15,
  },
  {
    key: "roles",
    type: "array",
    required: true,
    min: 1,
  },
];
```

## Rule Definition

Each rule in the `rules` array is an object with the following properties:

- `key` (string, required): The key to validate in the request body.
  -type (string, required): The expected data type. Supported types:
- `string`
- `number`
- `boolean`
- `array`
- `object`
- `email`
- `custom-regex`
- `custom-function`
- `required` (boolean, optional): Whether the key is required in the request body. Defaults to false.
- `min` (number, optional): The minimum length (for strings/arrays) or value (for numbers).
- `max` (number, optional): The maximum length (for strings/arrays) or value (for numbers).
- `regex` (RegExp, optional): A regular expression that the value must match (for strings).
- `customValidator` (Function, optional): A custom validation function that returns an error message if validation fails.

## Custom Validation

You can create custom validation rules using the `customValidator` function:

```javascript
[
  {
    key: "username",
    type: "custom-function",
    customValidator: (value) => {
      if (!/^[a-zA-Z0-9]+$/.test(value)) {
        return "Username should only contain alphanumeric characters";
      }
    },
  },
];
```

## Error Handling

If the request body fails validation, the middleware responds with a status of 200 OK and an object containing the following:

```json
{
  "status": 400,
  "message": ["Error message 1", "Error message 2"]
}
```

## Best Practices

For better organization, it is recommended to create a `rules` directory within the `src` directory. In this directory, create separate files for each set of rules, naming them according to the request they validate. For example:

```
src /
    rules /
        user-registration.rules.js;
        login.rules.js;
        profile-update.rules.js;
```
