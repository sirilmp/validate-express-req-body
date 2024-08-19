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

## Usage (Basic Example)

### CommonJS (CJS)

If you're using CommonJS modules (e.g., with Node.js versions prior to ESM support or a setup that does not support ESM), use the following examples:

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
//rules/create-user.rules.js

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

### ECMAScript Modules (ESM)

If you're using ECMAScript Modules (e.g., with modern Node.js versions or a setup that supports ESM), use the following examples:

```javascript
//index.mjs

import express from "express";
import validateRequestBody from "validate-express-req-body";
import createUserRules from "./rules/create-user.rules.mjs";

const app = express();
app.use(express.json());

app.post("/create-user", validateRequestBody(createUserRules), (req, res) => {
   res.status(200).json({req_body:req.body});
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
```

```javascript
//rules/create-user.rules.mjs

const createUserRules = [
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

export default createUserRules;
```

## Rule Definition

Each rule in the `rules` array is an object with the following properties:

### Validation Rules

The `validateRequestBody` middleware uses a set of validation rules to ensure the incoming request body meets specified criteria. Each rule is defined by the following properties:

| **Property**      | **Type**               | **Description**                                                                                                                                                                                                                                                                                                                                                                        | **Required** | **Default** |
|:-----------------:|:----------------------:| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |:------------:|:-----------:|
| `key`             | `string`               | The key to validate in the request body.                                                                                                                                                                                                                                                                                                                                               | Yes          | -           |
| `type`            | `string` or `string[]` | The `type` specifies the expected data type for the value. It can be one of the following supported types:<br> `string`, `number`, `boolean`, `array`, `object`, `email`, `custom-regex`, or `custom-function`.<br> You can provide a single type or an array of types. If you specify multiple types, the validation will succeed if the value matches any one of the provided types. | Yes          | -           |
| `required`        | `boolean`              | Whether the key is required in the request body.                                                                                                                                                                                                                                                                                                                                       | No           | `false`     |
| `min`             | `number` or `object`   | The minimum length (for strings/arrays) or value (for numbers). Can also be an object specifying different minimum values for different types.                                                                                                                                                                                                                                         | No           | -           |
| `max`             | `number` or `object`   | The maximum length (for strings/arrays) or value (for numbers). Can also be an object specifying different maximum values for different types.                                                                                                                                                                                                                                         | No           | -           |
| `regex`           | `RegExp`               | A regular expression that the value must match (for strings).                                                                                                                                                                                                                                                                                                                          | No           | -           |
| `customValidator` | `Function`             | A custom validation function that returns an error message if validation fails.                                                                                                                                                                                                                                                                                                        | No           | -           |

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

## Advanced Features

- **Nested Key Support**: Validate deeply nested object properties using dot notation. For example, to validate the `name` property inside the `profile` object which is nested within `user`, you can use `user.profile.name`.

**Example**

```javascript
//req.body

{
  "user": {
    "profile": {
      "name": "John Doe",
      "age": 30
    }
  }
}

//rule

const rules = [
  {
    key: "user.profile.name",
    type: "string",
    required: true,
    min: 3,
    max: 50,
  }
]

```

- **Array Indexing**: Validate specific elements within arrays using bracket notation. For instance, to validate the first element of the `contacts` array, use `contacts[0]`. Also you can use like this `user.contacts[0].value`

**Example**
```javascript
// req.body

{
"contacts": [
      {
        "type": "email",
        "value": "john.doe@example.com"
      },
      {
        "type": "phone",
        "value": "123-456-7890"
      }
    ]
}

// rule

const rules=[
  {
    key: "user.contacts[0]",
    type: "object",
    required: true,
  },{
    key: "user.contacts[0].type",
    type: "string",
    required: true,
  },
  {
    key: "user.contacts[0].value",
    type: "string",
    required: true,
  },
]

```

- **Support Multiple Types**:
  If you provide an array of types `(e.g., ['string', 'number'])`, the value will be considered valid if it matches any one of the specified types.

**Example**

  ```javascript
//req.body

{
  "user": {
    "profile": {
      "name": "John Doe",
      "age": 30
    }
  }
}

//rules

[
   {
    key: "user.profile.age",
    type: ["string", "number"],
    required: true,
    min: 18,
    max: 100,
  }
]

```

- **Support Multiple Min and Max**: You can also specify `min` and `max` as objects to apply different constraints based on the data type. This is particularly useful when a field can have multiple types.

**Example**

  ```javascript
//req.body

{
  "user": {
    "profile": {
      "name": "John Doe",
      "age": 30
    }
  }
}

//rules

[
   {
    key: "user.profile.age",
    type: ["string", "number"],
    required: true,
    min: { string: 3, number: 10 },
    max: { string: 15, number: 100 }
  }
]

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
src/
├── rules/
│   ├── user-registration.rules.js
│   ├── login.rules.js
│   └── profile-update.rules.js

```
