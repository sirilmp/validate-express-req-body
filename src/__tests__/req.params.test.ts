import { Request, Response, NextFunction } from "express";
import { params } from "../../dist";
import { HTTP_STATUS_BAD_REQUEST } from "../types/validation";

// Mock implementations of utility functions
jest.mock('../validators/utils', () => ({
  isPresent: jest.fn(),
  getValueFromNestedObject: jest.fn(),
  validateType: jest.fn(),
  validateValue: jest.fn(),
}));

describe('params', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should return 400 if rules are not properly defined', () => {
    const middleware = params(null as any);
    middleware(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      status: HTTP_STATUS_BAD_REQUEST,
      message: ['Validation rules are not properly defined.'],
    });
  });

  it('should return errors for invalid key type', () => {
    const middleware = params([{ key: '', type: 'string' }]);
    middleware(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      status: HTTP_STATUS_BAD_REQUEST,
      message: ['Key "" must be a non-empty string'],
    });
  });

  it('should return errors for invalid types', () => {
    const middleware = params([
      { key: 'age', type: 'invalid-type', required: true },
    ]);
    middleware(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      status: HTTP_STATUS_BAD_REQUEST,
      message: [
        'invalid-type is not a valid type. Allowed types are string, number, boolean, array, object, email, custom-regex, custom-function',
      ],
    });
  });
});

