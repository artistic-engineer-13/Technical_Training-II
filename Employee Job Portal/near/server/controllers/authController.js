import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import EmployeeProfile from '../models/employeeProfile.js';
import Company from '../models/company.js';
import { calculateProfileCompletion } from './profileController.js';

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    if (user) {
      // Automatically generate profile placeholder depending on role
      if (role === 'employee') {
        await EmployeeProfile.create({
          user: user._id,
          personalInfo: {
            name: user.name,
            email: user.email,
          },
        });
      } else if (role === 'recruiter') {
        await Company.create({
          recruiter: user._id,
          name: `${user.name}'s Company`,
        });
      }

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (user.status === 'suspended') {
        return res.status(403).json({ message: 'Your account has been suspended' });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let extraData = null;
    if (user.role === 'employee') {
      const ep = await EmployeeProfile.findOne({ user: user._id });
      if (ep) {
        extraData = {
          ...ep.toObject(),
          completionDetails: calculateProfileCompletion(ep)
        };
      }
    } else if (user.role === 'recruiter') {
      extraData = await Company.findOne({ recruiter: user._id });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      profile: extraData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving current user' });
  }
};
