// Authentication & Role-based Authorization Middleware

const isAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  req.flash('error_msg', 'Please log in to access this page');
  res.redirect('/auth/login');
};

const isGuest = (req, res, next) => {
  if (req.session && req.session.user) {
    const role = req.session.user.role;
    if (role === 'donor') return res.redirect('/donor/dashboard');
    if (role === 'ngo') return res.redirect('/ngo/feed');
    if (role === 'admin') return res.redirect('/admin/dashboard');
  }
  next();
};

const isRole = (allowedRoles) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      req.flash('error_msg', 'Please log in to continue');
      return res.redirect('/auth/login');
    }

    if (!roles.includes(req.session.user.role)) {
      req.flash('error_msg', 'Access denied. You do not have permission to view this resource.');
      const userRole = req.session.user.role;
      if (userRole === 'donor') return res.redirect('/donor/dashboard');
      if (userRole === 'ngo') return res.redirect('/ngo/feed');
      if (userRole === 'admin') return res.redirect('/admin/dashboard');
      return res.redirect('/');
    }

    next();
  };
};

module.exports = {
  isAuth,
  isGuest,
  isRole,
};
