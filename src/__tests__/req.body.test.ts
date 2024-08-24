import { Request, Response, NextFunction } from 'express';
import {body} from "../../dist";
import { HTTP_STATUS_BAD_REQUEST } from '../types/validation';

describe('body', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should return a 400 status if rules are not properly defined', () => {
    const middleware = body(null as any);
    middleware(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      status: HTTP_STATUS_BAD_REQUEST,
      message: ['Validation rules are not properly defined.'],
    });
  });

  it('should return errors for invalid key type', () => {
    const middleware = body([{ key: '', type: 'string' }]);
    middleware(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      status: HTTP_STATUS_BAD_REQUEST,
      message: ['Key "" must be a non-empty string'],
    });
  });

  it('should return errors for invalid types', () => {
    req.body = { name: 'John' };
    const middleware = body([
      { key: 'name', type: 'invalid-type', required: true },
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

  it('should process valid request body correctly', () => {
    req.body = { name: 'John', age: 30 };
    const middleware = body([
      { key: 'name', type: 'string', required: true },
      { key: 'age', type: 'number', required: true },
    ]);
    middleware(req as Request, res as Response, next);
    expect(req.body).toEqual({ name: 'John', age: 30 });
    expect(next).toHaveBeenCalled();
  });

  it('should handle custom validation rules', () => {
    req.body = { email: 'test@example.com' };
    const middleware = body([
      {
        key: 'email',
        type: 'email',
        customValidator: (value) => (value.includes('test') ? 'email is invalid' : null),
      },
    ]);
    middleware(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS_BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      status: HTTP_STATUS_BAD_REQUEST,
      message: ['email is invalid'],
    });
  });
});
