import validateRequestBody from '../index';
import { Request, Response, NextFunction } from 'express';

describe('validateRequestBody Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock<NextFunction>;

  beforeEach(() => {
    mockRequest = {
      body: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  test('should pass validation with no errors when all rules are satisfied', () => {
    mockRequest.body = { name: 'John Doe', age: 30 };
    const rules = [
      { key: 'name', type: 'string' as const, required: true },
      { key: 'age', type: 'number' as const, required: true }
    ];

    const middleware = validateRequestBody(rules);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
  });

  test('should return an error if a required field is missing', () => {
    mockRequest.body = { age: 30 };
    const rules = [
      { key: 'name', type: 'string' as const, required: true },
      { key: 'age', type: 'number' as const, required: true }
    ];

    const middleware = validateRequestBody(rules);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 400,
      message: ['name is required'],
    });
  });

  test('should return an error if the field type is incorrect', () => {
    mockRequest.body = { name: 'John Doe', age: 'thirty' };
    const rules = [
      { key: 'name', type: 'string' as const, required: true },
      { key: 'age', type: 'number' as const, required: true }
    ];

    const middleware = validateRequestBody(rules);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 400,
      message: ['age should be a valid number'],
    });
  });

  test('should return an error if the string length is less than min', () => {
    mockRequest.body = { name: 'Jo' };
    const rules = [
      { key: 'name', type: 'string' as const, required: true, min: 3 }
    ];

    const middleware = validateRequestBody(rules);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 400,
      message: ['name should have at least 3 characters'],
    });
  });

  test('should return an error if the string length is grater than max', () => {
    mockRequest.body = { name: 'John Babu' };
    const rules = [
      { key: 'name', type: 'string' as const, required: true, max: 5 }
    ];

    const middleware = validateRequestBody(rules);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 400,
      message: ['name should have at most 5 characters'],
    });
  });

  test('should return an error if the number is less than min', () => {
    mockRequest.body = { age: 17 };
    const rules = [
      { key: 'age', type: 'number' as const, required: true, min: 18 }
    ];
  
    const middleware = validateRequestBody(rules);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);
  
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 400,
      message: ['age should be at least 18'],
    });
  });

  test('should return an error if the number is grater than max', () => {
    mockRequest.body = { age: 20 };
    const rules = [
      { key: 'age', type: 'number' as const, required: true, max: 18 }
    ];
  
    const middleware = validateRequestBody(rules);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);
  
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 400,
      message: ['age should be at most 18'],
    });
  });

  test('should return an error if the array is less than min', () => {
    mockRequest.body = {hobbies:[] };
    const rules = [
      { key: 'hobbies', type: 'array' as const, required: true, min: 1 }
    ];
  
    const middleware = validateRequestBody(rules);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);
  
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 400,
      message: ['hobbies should have at least 1 items'],
    });
  });

  test('should return an error if the array is grater than max', () => {
    mockRequest.body = {hobbies:["reading","dancing",'swimming'] };
    const rules = [
      { key: 'hobbies', type: 'array' as const, required: true, max: 2 }
    ];
  
    const middleware = validateRequestBody(rules);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);
  
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 400,
      message: ['hobbies should have at most 2 items'],
    });
  });

  test('should validate email format correctly', () => {
    mockRequest.body = { email: 'not-an-email' };
    const rules = [
      { key: 'email', type: 'email' as const, required: true }
    ];

    const middleware = validateRequestBody(rules);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 400,
      message: ['email should be a valid email'],
    });
  });

  test('should use custom validator and return custom error message', () => {
    mockRequest.body = { age: 15 };
    const rules = [
      {
        key: 'age',
        type: 'number' as const,
        required: true,
        customValidator: (value: any) => value < 18 ? 'Age must be 18 or older' : null,
      }
    ];

    const middleware = validateRequestBody(rules);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 400,
      message: ['Age must be 18 or older'],
    });
  });

  test('should pass validation with regex validation', () => {
    mockRequest.body = { username: 'user123' };
    const rules = [
      {
        key: 'username',
        type: 'string' as const,
        required: true,
        regex: /^[a-zA-Z0-9]+$/,
      }
    ];

    const middleware = validateRequestBody(rules);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
  });
});
