import logger from '../config/logger.js';
import {signupSchema} from '../validations/auth.validations.js';
import {formatValidationErrors} from '../utils/format.js';

export const signup = async (req, res, next) => {
  try {
    const validationResult = signupSchema.safeParse(req.body);
    if (!validationResult.success) {
      logger.warn('Validation error during sign-up:', validationResult.error.errors);
      return res.status(400).json({ error: 'Invalid input', details: formatValidationErrors(validationResult.error) });
    }

    const { name, email, role } = validationResult.data;

    // AUTH SERVICE

    logger.info(`User signed up: ${email}`);
    res.status(201).json({
        message: 'User signed up successfully',
        user: {
            id: 1, name, email, role
        }
    });

  } catch (e) {
    logger.error('Error during sign-up:', e);
    if(e.message === 'User already exists'){
      res.status(409).json({ error: 'User already exists' });
    }
    next(e);
  }
};