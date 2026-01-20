// LoginPage.jsx → Ultra-butter UI with enhanced smoothness
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { EnvelopeIcon, LockClosedIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import LogoImage from '../../assets/image/logo.png';

const LoginPage = () => {
  const [email, setEmail] = useState('admin@iotblitz.com');
  const [password, setPassword] = useState('Admin@2025');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // Ultra-smooth spring transitions
  const springTransition = {
    type: "spring",
    stiffness: 260,
    damping: 20
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.6,
        ease: [0.34, 1.56, 0.64, 1] // Custom easing curve
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center p-4">
      
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-sm"
      >
        {/* Ultra-Clean White Card with subtle shadow */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-primary-200/50 border border-primary-100/50 p-8 relative overflow-hidden">
          
          {/* Subtle animated background gradient */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-primary-50/30 to-transparent opacity-0 pointer-events-none"
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Logo & Title */}
          <motion.div 
            className="text-center mb-8 relative z-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, ...springTransition }}
          >
            <motion.div 
              className="inline-flex items-center justify-center w-30 h-30 rounded-2xl"
              whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
              transition={springTransition}
            >
              <img src={LogoImage} alt="HrExon" className="w-30 h-30 object-contain" />
            </motion.div>
            <h1 className="text-3xl font-bold text-secondary-700 bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
              HrExon
            </h1>
            <p className="text-sm text-secondary-500 mt-1">Sign in to continue</p>
          </motion.div>

          {/* Error with smooth entry/exit */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="mb-4 overflow-hidden"
              >
                <div className="text-red-600 text-center text-sm font-medium bg-red-50 py-2.5 px-4 rounded-xl border border-red-100">
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            
            {/* Email Field */}
            <motion.div 
              className="relative"
              animate={{ scale: focusedField === 'email' ? 1.02 : 1 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <motion.div
                animate={{ 
                  x: focusedField === 'email' ? [0, -2, 2, 0] : 0,
                  color: focusedField === 'email' ? '#3b82f6' : '#9ca3af'
                }}
                transition={{ duration: 0.3 }}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10"
              >
                <EnvelopeIcon className="h-5 w-5" />
              </motion.div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                placeholder="Email address"
                className="w-full pl-11 pr-4 py-3.5 bg-accent-lightBlue/50 border-2 border-primary-200 rounded-xl text-secondary-700 placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-500 focus:bg-white transition-all duration-300 text-sm font-medium"
                required
              />
            </motion.div>

            {/* Password Field */}
            <motion.div 
              className="relative"
              animate={{ scale: focusedField === 'password' ? 1.02 : 1 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <motion.div
                animate={{ 
                  x: focusedField === 'password' ? [0, -2, 2, 0] : 0,
                  color: focusedField === 'password' ? '#3b82f6' : '#9ca3af'
                }}
                transition={{ duration: 0.3 }}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10"
              >
                <LockClosedIcon className="h-5 w-5" />
              </motion.div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                placeholder="Password"
                className="w-full pl-11 pr-4 py-3.5 bg-accent-lightBlue/50 border-2 border-primary-200 rounded-xl text-secondary-700 placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-500 focus:bg-white transition-all duration-300 text-sm font-medium"
                required
              />
            </motion.div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="w-3.5 h-3.5 rounded border-primary-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0 transition-all duration-200" 
                />
                <span className="text-secondary-600 group-hover:text-secondary-700 transition-colors">
                  Remember me
                </span>
              </label>
              <motion.a 
                href="#" 
                className="text-primary-600 hover:text-primary-700 font-medium relative"
                whileHover={{ x: 2 }}
                transition={{ duration: 0.2 }}
              >
                Forgot?
              </motion.a>
            </div>

            {/* Ultra-Smooth Button */}
            <motion.button
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 20px 25px -5px rgba(59, 130, 246, 0.3), 0 10px 10px -5px rgba(59, 130, 246, 0.2)"
              }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden group"
            >
              {/* Button shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
              
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" className="opacity-75" />
                    </svg>
                    <span>Signing in...</span>
                  </motion.div>
                ) : (
                  <motion.span
                    key="signin"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative z-10"
                  >
                    Sign In
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </form>

          {/* Sign Up */}
          <motion.p 
            className="text-center text-xs text-secondary-500 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            No account?{' '}
            <motion.a 
              href="#" 
              className="font-semibold text-primary-600 hover:text-primary-700 relative inline-block"
              whileHover={{ y: -1 }}
              transition={{ duration: 0.2 }}
            >
              Sign up
              <motion.span 
                className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.a>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
