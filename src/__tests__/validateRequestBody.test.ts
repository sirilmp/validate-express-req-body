import validateRequestBody from "../index";
import { Request, Response, NextFunction } from "express";

describe("validateRequestBody Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock<NextFunction>;

  beforeEach(() => {
    mockRequest = {
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  test("should pass validation with no errors when all rules are satisfied", () => {
    mockRequest.body = { name: "John Doe", age: 30 };
    const rules = [
      { key: "name", type: "string" as const, required: true },
      { key: "age", type: "number" as const, required: true },
    ];

    const middleware = validateRequestBody(rules);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
  });

  test("should return an error if a required field is missing", () => {
    mockRequest.body = { age: 30 };
    const rules = [
      { key: "name", type: "string" as const, required: true },
      { key: "age", type: "number" as const, required: true },
    ];

    const middleware = validateRequestBody(rules);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 400,
      message: ["name is required"],
    });
  });

  test("should return an error if the field type is incorrect", () => {
    mockRequest.body = { name: "John Doe", age: "thirty" };
    const rules = [
      { key: "name", type: "string" as const, required: true },
      { key: "age", type: "number" as const, required: true },
    ];

    const middleware = validateRequestBody(rules);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 400,
      message: ["age should be a valid number"],
    });
  });

  test("should return an error if the string length is less than min", () => {
    mockRequest.body = { name: "Jo" };
    const rules = [
      { key: "name", type: "string" as const, required: true, min: 3 },
    ];

    const middleware = validateRequestBody(rules);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 400,
      message: ["name type is string, it should be at least 3 characters"],
    });
  });

  test("should return an error if the string length is grater than max", () => {
    mockRequest.body = { name: "John Babu" };
    const rules = [
      { key: "name", type: "string" as const, required: true, max: 5 },
    ];

    const middleware = validateRequestBody(rules);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 400,
      message: ["name type is string, it should be at most 5 characters"],
    });
  });

  test("should return an error if the number is less than min", () => {
    mockRequest.body = { age: 17 };
    const rules = [
      { key: "age", type: "number" as const, required: true, min: 18 },
    ];

    const middleware = validateRequestBody(rules);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 400,
      message: ["age type is number, it should be at least 18"],
    });
  });

  test("should return an error if the number is grater than max", () => {
    mockRequest.body = { age: 20 };
    const rules = [
      { key: "age", type: "number" as const, required: true, max: 18 },
    ];

    const middleware = validateRequestBody(rules);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 400,
      message: ["age type is number, it should be at most 18"],
    });
  });

  test("should return an error if the array is less than min", () => {
    mockRequest.body = { hobbies: [] };
    const rules = [
      { key: "hobbies", type: "array" as const, required: true, min: 1 },
    ];

    const middleware = validateRequestBody(rules);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 400,
      message: ["hobbies type is array, it should be at least 1 items"],
    });
  });

  test("should return an error if the array is grater than max", () => {
    mockRequest.body = { hobbies: ["reading", "dancing", "swimming"] };
    const rules = [
      { key: "hobbies", type: "array" as const, required: true, max: 2 },
    ];

    const middleware = validateRequestBody(rules);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 400,
      message: ["hobbies type is array, it should be at most 2 items"],
    });
  });

  test("should validate email format correctly", () => {
    mockRequest.body = { email: "not-an-email" };
    const rules = [{ key: "email", type: "email" as const, required: true }];

    const middleware = validateRequestBody(rules);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 400,
      message: ["email should be a valid email"],
    });
  });

  test("should use custom validator and return custom error message", () => {
    mockRequest.body = { age: 15 };
    const rules = [
      {
        key: "age",
        type: "number" as const,
        required: true,
        customValidator: (value: any) =>
          value < 18 ? "Age must be 18 or older" : null,
      },
    ];

    const middleware = validateRequestBody(rules);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 400,
      message: ["Age must be 18 or older"],
    });
  });

  test("should pass validation with regex validation", () => {
    mockRequest.body = { username: "user123" };
    const rules = [
      {
        key: "username",
        type: "string" as const,
        required: true,
        regex: /^[a-zA-Z0-9]+$/,
      },
    ];

    const middleware = validateRequestBody(rules);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
  });

  test("nested object and array key support", () => {
    mockRequest.body = {
      name: "John McExpress",
      age: {
        y: 444,
        m: 0.8,
        d: "monday",
      },
      addresses: {
        work: {
          country: "express-validator land",
        },
      },
      siblings: [{ name: "Maria von Validator" }, { name: "John" }],
      websites: {
        "www.example.com": { dns: "1.2.3.4" },
      },
    };
    const rules = [
      {
        key: "name",
        type: "string" as const,
        required: true,
      },
      {
        key: "addresses.work.country",
        type: "string" as const,
        required: true,
      },
      {
        key: "siblings",
        type: "array" as const,
        required: true,
      },
      {
        key: "siblings[0]",
        type: "object" as const,
        required: true,
      },
      {
        key: "age.y",
        type: "number" as const,
        required: false,
      },
    ];

    const middleware = validateRequestBody(rules);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
  });

  test("nested object key support", () => {
    mockRequest.body = {
      user: {
        profile: {
          name: "John Doe",
          age: 30,
        },
        contacts: [
          {
            type: "email",
            value: "john.doe@example.com",
          },
          {
            type: "phone",
            value: "123-456-7890",
          },
        ],
      },
    };

    const rules = [
      {
        key: "user.profile.name",
        type: "string" as const,
        required: true,
        min: 3,
        max: 50,
      },
      {
        key: "user.profile.age",
        type: "number" as const,
        required: true,
        min: 18,
        max: 120,
      },
      {
        key: "user.contacts",
        type: "array" as const,
        required: true,
        min: 1,
      },
      {
        key: "user.contacts[0]",
        type: "object" as const,
        required: true,
      },
      {
        key: "user.contacts[0].type",
        type: "string" as const,
        required: true,
      },
      {
        key: "user.contacts[0].value",
        type: "string" as const,
        required: true,
      },
    ];

    const middleware = validateRequestBody(rules);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
  });

  test("support multiple types with single min and max", () => {
    mockRequest.body = {
      user: {
        profile: {
          name: "John Doe",
          age: "30",
        },
      },
    };

    const rules = [
      {
        key: "user.profile.age",
        type: ["number", "string"],
        required: true,
        min: 1,
        max: 12,
      },
    ];

    const middleware = validateRequestBody(rules);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
  });

  test("support multiple types multiple min and single max", () => {
    mockRequest.body = {
      user: {
        profile: {
          name: "John Doe",
          age: "30",
        },
      },
    };

    const rules = [
      {
        key: "user.profile.age",
        type: ["number", "string"],
        required: true,
        min: {
          string: 2,
          number: 1,
        },
        max: 12,
      },
    ];

    const middleware = validateRequestBody(rules);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
  });

  test("support multiple types, multiple min and max", () => {
    mockRequest.body = {
      user: {
        profile: {
          name: "John Doe",
          age: "30",
        },
      },
    };

    const rules = [
      {
        key: "user.profile.age",
        type: ["number", "string"],
        required: true,
        min: {
          string: 2,
          number: 1,
        },
        max: {
          string: 3,
          number: 100,
        },
      },
    ];

    const middleware = validateRequestBody(rules);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
  });
});
