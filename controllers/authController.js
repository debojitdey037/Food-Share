const User = require('../models/User');

// GET /auth/signup
const getSignup = (req, res) => {
  res.render('auth/signup', {
    title: 'Sign Up - FoodShare',
    errors: [],
    formData: {},
  });
};

// POST /auth/signup
const postSignup = async (req, res) => {
  const { name, email, password, confirmPassword, role, organizationName, phone, address, pincode } = req.body;
  const errors = [];
  const formData = { name, email, role, organizationName, phone, address, pincode };

  // Validations
  if (!name || !email || !password || !role || !phone || !address || !pincode) {
    errors.push({ msg: 'Please fill in all required fields.' });
  }

  if (password !== confirmPassword) {
    errors.push({ msg: 'Passwords do not match.' });
  }

  if (password && password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters long.' });
  }

  if (!['donor', 'ngo'].includes(role)) {
    errors.push({ msg: 'Invalid role selected.' });
  }

  if (errors.length > 0) {
    return res.render('auth/signup', {
      title: 'Sign Up - FoodShare',
      errors,
      formData,
    });
  }

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      errors.push({ msg: 'An account with this email address already exists.' });
      return res.render('auth/signup', {
        title: 'Sign Up - FoodShare',
        errors,
        formData,
      });
    }

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password,
      role,
      organizationName: organizationName || '',
      phone,
      address,
      pincode,
    });

    await newUser.save();

    req.flash('success_msg', 'Account registered successfully! You can now log in.');
    res.redirect('/auth/login');
  } catch (error) {
    console.error('Signup error:', error);
    errors.push({ msg: 'Server error during registration. Please try again.' });
    res.render('auth/signup', {
      title: 'Sign Up - FoodShare',
      errors,
      formData,
    });
  }
};

// GET /auth/login
const getLogin = (req, res) => {
  res.render('auth/login', {
    title: 'Log In - FoodShare',
    errors: [],
    email: '',
  });
};

// POST /auth/login
const postLogin = async (req, res) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !password) {
    errors.push({ msg: 'Please enter both email and password.' });
    return res.render('auth/login', {
      title: 'Log In - FoodShare',
      errors,
      email,
    });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      errors.push({ msg: 'Invalid email or password.' });
      return res.render('auth/login', {
        title: 'Log In - FoodShare',
        errors,
        email,
      });
    }

    if (!user.isActive) {
      errors.push({ msg: 'Your account has been deactivated. Please contact support/admin.' });
      return res.render('auth/login', {
        title: 'Log In - FoodShare',
        errors,
        email,
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      errors.push({ msg: 'Invalid email or password.' });
      return res.render('auth/login', {
        title: 'Log In - FoodShare',
        errors,
        email,
      });
    }

    // Set user session
    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationName: user.organizationName,
      phone: user.phone,
      pincode: user.pincode,
    };

    req.flash('success_msg', `Welcome back, ${user.name}!`);

    // Redirect based on role
    if (user.role === 'donor') return res.redirect('/donor/dashboard');
    if (user.role === 'ngo') return res.redirect('/ngo/feed');
    if (user.role === 'admin') return res.redirect('/admin/dashboard');

    res.redirect('/');
  } catch (error) {
    console.error('Login error:', error);
    errors.push({ msg: 'Server error during login. Please try again.' });
    res.render('auth/login', {
      title: 'Log In - FoodShare',
      errors,
      email,
    });
  }
};

// GET /auth/logout
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout session destruction error:', err);
    }
    res.redirect('/auth/login');
  });
};

module.exports = {
  getSignup,
  postSignup,
  getLogin,
  postLogin,
  logout,
};
