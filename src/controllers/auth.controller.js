import logger from '../config/logger.js';
import {signupSchema, signinSchema} from '../validations/auth.validations.js';
import {formatValidationErrors} from '../utils/format.js';
import {createUser, authenticateUser} from '../services/auth.service.js';
import {jwttoken} from '../utils/jwt.js';
import {cookies} from '../utils/cookies.js';

export const signup = async (req, res, next) => {
  try {
    const validationResult = signupSchema.safeParse(req.body);
    if (!validationResult.success) {
      logger.warn('Validation error during sign-up:', validationResult.error.errors);
      return res.status(400).json({ error: 'Invalid input', details: formatValidationErrors(validationResult.error) });
    }

    const { name, email, password, role } = validationResult.data;

    const user = await createUser({ name, email,password, role });
    const token = jwttoken.sign({id: user.id,email: user.email, role: user.role});
    cookies.set(res,'token',token);



    logger.info(`User signed up: ${email}`);
    res.status(201).json({
      message: 'User signed up successfully',
      user: {
        id: user.id, name: user.name, email:user.email, role:user.role
      }
    });

  } catch (e) {
    logger.error('Error during sign-up:', e);
    if(e.message === 'User already exists'){
      return res.status(409).json({ error: 'User already exists' });
    }
    next(e);
  }
};

export const signin = async (req, res, next) => {
  try {
    const validationResult = signinSchema.safeParse(req.body);
    if (!validationResult.success) {
      logger.warn('Validation error during sign-in:', validationResult.error.errors);
      return res.status(400).json({ error: 'Invalid input', details: formatValidationErrors(validationResult.error) });
    }

    const { email, password } = validationResult.data;

    const user = await authenticateUser({ email, password });
    const token = jwttoken.sign({id: user.id, email: user.email, role: user.role});
    cookies.set(res, 'token', token);

    logger.info(`User signed in: ${email}`);
    res.status(200).json({
      message: 'User signed in successfully',
      user: {
        id: user.id, name: user.name, email: user.email, role: user.role
      }
    });

  } catch (e) {
    logger.error('Error during sign-in:', e);
    if(e.message === 'User not found' || e.message === 'Invalid password') {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    next(e);
  }
};

export const signout = async (req, res, next) => {
  try {
    // Clear the authentication cookie
    cookies.clear(res, 'token');

    logger.info('User signed out successfully');
    res.status(200).json({
      message: 'User signed out successfully'
    });

  } catch (e) {
    logger.error('Error during sign-out:', e);
    next(e);
  }
};
