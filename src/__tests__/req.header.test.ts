import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS_BAD_REQUEST } from "../types/validation";
import { header } from "../../dist";

describe("header Middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it("should return 400 if rules are not properly defined", () => {
    const middleware = header(null as any);
    middleware(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      status: HTTP_STATUS_BAD_REQUEST,
      message: ["Validation rules are not properly defined."],
    });
  });

  it("should return errors for invalid key type", () => {
    const middleware = header([{ key: "", type: "string" }]);
    middleware(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      status: HTTP_STATUS_BAD_REQUEST,
      message: ['Key "" must be a non-empty string'],
    });
  });

  it("should return errors for invalid types", () => {
    const middleware = header([{ key: "age", type: "invalid-type", required: true }]);
    middleware(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      status: HTTP_STATUS_BAD_REQUEST,
      message: [
        "invalid-type is not a valid type. Allowed types are string, number, boolean, array, object, email, url, custom-regex, custom-function",
      ],
    });
  });

  it("should add validated data to headers", () => {
    req.headers = { "x-custom-header": "12345" };
    const middleware = header([
      { key: "x-custom-header", type: "string", required: true },
    ]);

    middleware(req as Request, res as Response, next);

    expect((req.headers as any)).toEqual({
      "x-custom-header": "12345",
    });
    expect(next).toHaveBeenCalled();
  });

  it("should handle missing required headers", () => {
    const middleware = header([
      { key: "x-custom-header", type: "string", required: true },
    ]);

    middleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      status: HTTP_STATUS_BAD_REQUEST,
      message: ["x-custom-header is required"],
    });
  });

  it("should handle valid headers correctly", () => {
    req.headers = { "x-custom-header": "valid-value" };
    const middleware = header([
      { key: "x-custom-header", type: "string" },
    ]);

    middleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect((req.headers as any)).toEqual({
      "x-custom-header": "valid-value",
    });
  });

  it("should handle header with custom validator", () => {
    const customValidator = (value: any): string | null => {
      if (typeof value === 'string' && value.startsWith('valid')) {
        return null;
      }
      return 'Value must start with "valid"';
    };
  
    req.headers = { "x-custom-header": "valid-value" };
    const middleware = header([
      { key: "x-custom-header", type: "string", customValidator },
    ]);
  
    middleware(req as Request, res as Response, next);
  
    expect(next).toHaveBeenCalled();
    expect((req.headers as any)).toEqual({
      "x-custom-header": "valid-value",
    });
  });
  
  it("should return 400 for custom validator error", () => {
    const customValidator = (value: any): string | null => {
      if (typeof value === 'string' && value.startsWith('valid')) {
        return null; // Validation passes
      }
      return 'Value must start with "valid"'; // Validation fails
    };
  
    req.headers = { "x-custom-header": "invalid-value" };
    const middleware = header([
      { key: "x-custom-header", type: "string", customValidator },
    ]);
  
    middleware(req as Request, res as Response, next);
  
    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      status: HTTP_STATUS_BAD_REQUEST,
      message: ['Value must start with "valid"'],
    });
  });
});
