import { Request, Response, NextFunction } from "express";
import { query } from "../../dist";
import { HTTP_STATUS_BAD_REQUEST } from "../types/validation";

describe("query", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it("should return a 400 status if rules are not properly defined", () => {
    const middleware = query(null as any);
    middleware(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      status: HTTP_STATUS_BAD_REQUEST,
      message: ["Validation rules are not properly defined."],
    });
  });

  it("should return errors for invalid key type", () => {
    const middleware = query([{ key: "", type: "string" }]);
    middleware(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      status: HTTP_STATUS_BAD_REQUEST,
      message: ['Key "" must be a non-empty string'],
    });
  });

  it("should return errors for invalid types", () => {
    req.query = { name: "John" };
    const middleware = query([
      { key: "name", type: "invalid-type", required: true },
    ]);
    middleware(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      status: HTTP_STATUS_BAD_REQUEST,
      message: [
        "invalid-type is not a valid type. Allowed types are string, number, boolean, array, object, email, custom-regex, custom-function",
      ],
    });
  });

  it("should process valid request query parameters correctly", () => {
    req.query = { name: "John", age: "30" };
    const middleware = query([
      { key: "name", type: "string", required: true },
      { key: "age", type: "number", required: true },
    ]);
    middleware(req as Request, res as Response, next);
    expect(req.query).toEqual({ name: "John", age: 30 });
    expect(next).toHaveBeenCalled();
  });

  it("should handle type conversion for numbers", () => {
    req.query = { age: "25" };
    const middleware = query([{ key: "age", type: "number" }]);
    middleware(req as Request, res as Response, next);
    expect(req.query).toEqual({ age: 25 });
    expect(next).toHaveBeenCalled();
  });

  it("should handle type conversion for arrays", () => {
    req.query = { tags: "a,b,c" };
    const middleware = query([{ key: "tags", type: "array" }]);
    middleware(req as Request, res as Response, next);
    expect(req.query).toEqual({ tags: ["a", "b", "c"] });
    expect(next).toHaveBeenCalled();
  });

  it("should return errors for missing required parameters", () => {
    req.query = {};
    const middleware = query([
      { key: "name", type: "string", required: true },
    ]);
    middleware(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      status: HTTP_STATUS_BAD_REQUEST,
      message: ["name is required"],
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should apply custom validators", () => {
    req.query = { email: "test@example.com" };
    const customValidator = jest.fn().mockReturnValue(null);
    const middleware = query([
      {
        key: "email",
        type: "email",
        customValidator,
      },
    ]);
    middleware(req as Request, res as Response, next);
    expect(customValidator).toHaveBeenCalledWith("test@example.com");
    expect(req.query).toEqual({ email: "test@example.com" });
    expect(next).toHaveBeenCalled();
  });

  it("should return errors from custom validators", () => {
    req.query = { email: "test@example.com" };
    const customValidator = jest.fn().mockReturnValue("Email is invalid");
    const middleware = query([
      {
        key: "email",
        type: "email",
        customValidator,
      },
    ]);
    middleware(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      status: HTTP_STATUS_BAD_REQUEST,
      message: ["Email is invalid"],
    });
    expect(next).not.toHaveBeenCalled();
  });
});
