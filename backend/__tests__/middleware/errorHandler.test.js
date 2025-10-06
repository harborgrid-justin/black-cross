/**
 * Error Handler Middleware Tests
 * Test enterprise error handling functionality
 */

const {
  AppError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  errorHandler,
  asyncHandler,
} = require('../../middleware/errorHandler');

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create error with correct properties', () => {
      const error = new AppError('Test error', 400, true, { detail: 'test' });

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
      expect(error.details).toEqual({ detail: 'test' });
      expect(error.timestamp).toBeDefined();
    });

    it('should have default values', () => {
      const error = new AppError('Test error');

      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
      expect(error.details).toBeNull();
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with 400 status', () => {
      const error = new ValidationError('Invalid input');

      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('ValidationError');
      expect(error.isOperational).toBe(true);
    });
  });

  describe('AuthenticationError', () => {
    it('should create auth error with 401 status', () => {
      const error = new AuthenticationError();

      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Authentication failed');
      expect(error.name).toBe('AuthenticationError');
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error with 404 status', () => {
      const error = new NotFoundError('User');

      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('User not found');
      expect(error.name).toBe('NotFoundError');
    });
  });
});

describe('errorHandler middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      path: '/test',
      method: 'GET',
      correlationId: 'test-123',
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('test-agent'),
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    next = jest.fn();
  });

  it('should handle AppError correctly', () => {
    const error = new AppError('Test error', 400);

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        statusCode: 400,
        message: 'Test error',
      }),
    );
  });

  it('should handle generic errors', () => {
    const error = new Error('Generic error');

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        statusCode: 500,
        message: 'Generic error',
      }),
    );
  });

  it('should include correlation ID in response', () => {
    const error = new AppError('Test error');

    errorHandler(error, req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        correlationId: 'test-123',
      }),
    );
  });
});

describe('asyncHandler', () => {
  it('should call next with error on rejection', async () => {
    const error = new Error('Test error');
    const handler = asyncHandler(async () => {
      throw error;
    });

    const req = {};
    const res = {};
    const next = jest.fn();

    await handler(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('should work with successful async functions', async () => {
    const handler = asyncHandler(async (req, res) => {
      res.json({ success: true });
    });

    const req = {};
    const res = { json: jest.fn() };
    const next = jest.fn();

    await handler(req, res, next);

    expect(res.json).toHaveBeenCalledWith({ success: true });
    expect(next).not.toHaveBeenCalled();
  });
});
