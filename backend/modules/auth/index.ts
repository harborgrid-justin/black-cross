/**
 * Authentication Module
 *
 * This module handles:
 * - User login and logout
 * - JWT token generation and validation
 * - User authentication
 */

import type { Router, Request, Response } from 'express';
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { initializeSequelize } from '../../config/sequelize';
import User from '../../models/User';

// Initialize Sequelize to load models
initializeSequelize();

const router: Router = express.Router();

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  token?: string;
  expires_in?: number;
  user?: {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  error?: string;
}

// Login endpoint
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as LoginRequest;

    // Validate input
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email and password are required',
      } as LoginResponse);
      return;
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      } as LoginResponse);
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      } as LoginResponse);
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(403).json({
        success: false,
        error: 'Account is inactive',
      } as LoginResponse);
      return;
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_change_in_production';
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      jwtSecret,
      { expiresIn: '24h' },
    );

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Return success response
    res.json({
      success: true,
      data: {
        token,
        expires_in: 86400, // 24 hours in seconds
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    } as LoginResponse);
  }
});

// Logout endpoint
router.post('/logout', (req: Request, res: Response): void => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

// Get current user endpoint (requires auth middleware)
router.get('/me', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'No authentication token provided',
      });
      return;
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_change_in_production';

    try {
      const decoded = jwt.verify(token, jwtSecret) as { id: number };
      const user = await User.findByPk(decoded.id);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      });
    } catch (jwtError) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;
