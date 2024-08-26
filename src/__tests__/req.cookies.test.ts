import { Request, Response, NextFunction } from "express";
import { cookie } from "../../dist";
import { HTTP_STATUS_BAD_REQUEST } from "../types/validation";

// Mock implementations of utility functions
jest.mock("../validators/utils", () => ({
  isPresent: jest.fn(),
  getValueFromNestedObject: jest.fn(),
  validateType: jest.fn(),
  validateValue: jest.fn(),
}));

describe("cookie - Cookie Validation", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { cookies: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it("should return 400 if token is missing in cookies", () => {
    req.cookies = {}; // No token present
    const middleware = cookie([
      {
        key: "token",
        type: "string",
        required: true,
      },
    ]);

    middleware(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      status: HTTP_STATUS_BAD_REQUEST,
      message: ["token is required"],
    });
  });

  it("should proceed if token is present in cookies", () => {
    req.cookies = { token: "valid-token" }; // Token is present
    const middleware = cookie([
      {
        key: "token",
        type: "string",
        required: true,
      },
    ]);

    middleware(req as Request, res as Response, next);
    expect(req.cookies).toEqual({ token: "valid-token" });
    expect(next).toHaveBeenCalled();
  });
});
