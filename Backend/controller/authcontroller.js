const User = require('../models/User');
// User model
const jwt = require('jsonwebtoken');
// JWT library

// ============ HELPER FUNCTION ============
const generateToken = (id) => {
  // JWT token banata hai
  
  return jwt.sign(
    { id },
    // Payload = User ID
    
    process.env.JWT_SECRET,
    // Secret key
    
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
      // Token expiry = 7 days (default)
    }
  );
};

// ============ SIGNUP CONTROLLER ============
exports.signup = async (req, res, next) => {
  // req.body mein frontend se data aayega
  // async = Database operation async hai
  
  try {
    // -------- GET DATA FROM REQUEST --------
    const { name, email, password, userType } = req.body;
    // Destructuring = req.body se directly nikalo

    // -------- VALIDATION --------
    if (!name || !email || !password || !userType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
      // 400 = Bad Request (invalid input)
    }

    // -------- CHECK IF USER EXISTS --------
    let user = await User.findOne({ email });
    // Database mein email search karo
    // await = Result aane tak wait karo
    
    if (user) {
      // Agar user already exist karta hai
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // -------- CREATE NEW USER --------
    user = new User({
      name,
      email,
      password,
      userType,
      // Password automatically hash hoga (model mein pre-hook)
    });

    await user.save();
    // Database mein save karo

    // -------- GENERATE TOKEN --------
    const token = generateToken(user._id);
    // _id = MongoDB automatically create karta hai

    // -------- SEND RESPONSE --------
    res.status(201).json({
      // 201 = Created (new resource)
      
      success: true,
      message: 'User registered successfully',
      token,
      user: user.getPublicProfile(),
      // getPublicProfile() = Password exclude karke return
    });

  } catch (error) {
    next(error);
    // Error handler middleware ko pass karo
  }
};

// ============ LOGIN CONTROLLER ============
exports.login = async (req, res, next) => {
  try {
    // -------- GET DATA --------
    const { email, password } = req.body;

    // -------- VALIDATION --------
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // -------- FIND USER --------
    const user = await User.findOne({ email }).select('+password');
    // .select('+password') = Password field bhi include kar
    // (Model mein select: false tha, to explicitly lena padta hai)
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // -------- COMPARE PASSWORD --------
    const isPasswordMatch = await user.comparePassword(password);
    // comparePassword() = Model ka custom method
    // Hashed password se match karta hai
    
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // -------- GENERATE TOKEN --------
    const token = generateToken(user._id);

    // -------- SEND RESPONSE --------
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: user.getPublicProfile(),
    });

  } catch (error) {
    next(error);
  }
};

// ============ GET CURRENT USER ============
exports.getCurrentUser = async (req, res, next) => {
  // req.userId = Auth middleware se aata hai
  
  try {
    // -------- FIND USER --------
    const user = await User.findById(req.userId);
    // req.userId = JWT token mein se extract hua

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // -------- SEND RESPONSE --------
    res.json({
      success: true,
      user: user.getPublicProfile(),
    });

  } catch (error) {
    next(error);
  }
};