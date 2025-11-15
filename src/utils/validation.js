import { ValidationError } from './errorHandler.js';

export const validateExample = (req, res, next) => {
  const { name } = req.body;
  const errors = [];
  const isUpdate = req.method === 'PUT' || req.method === 'PATCH';

  if (!name && !isUpdate) {
    errors.push({
      field: 'name',
      message: 'Name is required'
    });
  } else if (name !== undefined) {
    if (typeof name !== 'string') {
      errors.push({
        field: 'name',
        message: 'Name must be a string'
      });
    } else if (name.trim().length < 3) {
      errors.push({
        field: 'name',
        message: 'Name must be at least 3 characters long'
      });
    }
  }

  if (errors.length > 0) {
    return next(new ValidationError('Validation failed', errors));
  }

  next();
};

export const validateId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    return next(new ValidationError('Valid ID is required'));
  }
  
  next();
};
