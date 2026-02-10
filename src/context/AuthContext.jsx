import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../services/authAPI';



import { decodeJWT } from '../utils/jwtHelper';  // Create this file
import { canAccessRoute } from '../config/userTypePermissions'; 

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is logged in on mount
  // useEffect(() => {
  //   const checkAuth = async () => {
  //     try {
  //       const storedUser = localStorage.getItem('user');
  //       const token = localStorage.getItem('token');
        
  //       if (storedUser && token) {
  //         setUser(JSON.parse(storedUser));
          
  //         // Verify token by fetching profile
  //         try {
  //           const profileData = await authAPI.getProfile();
  //           const userData = profileData.user || profileData.data || profileData;
  //           setUser(userData);
  //           localStorage.setItem('user', JSON.stringify(userData));
  //         } catch (error) {
  //           // Token invalid, clear storage
  //           console.error('Token validation failed:', error);
  //           localStorage.clear();
  //           setUser(null);
  //         }
  //       }
  //     } catch (error) {
  //       console.error('Error loading user from localStorage:', error);
  //       localStorage.clear();
  //       setUser(null);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   checkAuth();
  // }, []);


  // In AuthContext.jsx - update checkAuth function
useEffect(() => {
  const checkAuth = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (storedUser && token) {
        // DECODE TOKEN DIRECTLY - FASTEST
        const tokenPayload = decodeJWT(token);
        
        if (tokenPayload?.userType) {
          const userData = {
            ...JSON.parse(storedUser),
            userType: tokenPayload.userType,  // From your JWT
            tokenPayload  // Full payload if needed
          };
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          return;
        }
      }
      
      // Fallback to getProfile if token invalid
      localStorage.clear();
      setUser(null);
    } catch (error) {
      localStorage.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  checkAuth();
}, []);





  // const login = async (email, password) => {
  //   try {
  //     const response = await authAPI.login(email, password);
  //       console.log("??????",response.data.token);
  //     if (response.success !== false) {
  //       const userData = response.data.user;
  //       const token = response.data.token;
  //       const refreshToken = response.data.refreshToken;
        
  //       // Store in localStorage
  //       localStorage.setItem('user', JSON.stringify(userData));
  //       localStorage.setItem('token', token);
  //       if (refreshToken) {
  //         localStorage.setItem('refreshToken', refreshToken);
  //       }
  //       localStorage.setItem('loginTime', new Date().toISOString());
        
  //       setUser(userData);
        
  //       // Get redirect path from location state
  //       const from = location.state?.from || '/dashboard';
  //       navigate(from, { replace: true });
        
  //       return { success: true };
  //     }
      
  //     return { success: false, error: response.message || 'Login failed' };
  //   } catch (error) {
  //     console.error('Login error:', error);
  //     const errorMessage = error.message || 'Login failed. Please try again.';
  //     return { success: false, error: errorMessage };
  //   }
  // };



const login = async (email, password) => {
  try {
    const response = await authAPI.login(email, password);
    console.log("??????",response.data.token);
    if (response.success !== false) {
      const userData = response.data.user;
      const token = response.data.token;
      const refreshToken = response.data.refreshToken;
      
      // 🔥 DECODE TOKEN & ADD userType
      const tokenPayload = decodeJWT(token);
      
      // 🔥 MERGE userType into user data
      const userWithType = {
        ...userData,
        userType: tokenPayload?.userType || userData.userType
      };
      
      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(userWithType));
      localStorage.setItem('token', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      localStorage.setItem('loginTime', new Date().toISOString());
      
      setUser(userWithType);  // 🔥 Use merged data
      
      const from = location.state?.from || '/dashboard';
      navigate(from, { replace: true });
      
      return { success: true };
    }
    
    return { success: false, error: response.message || 'Login failed' };
  } catch (error) {
    // ... rest unchanged
  }
};



  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      
      if (response.success !== false) {
        // Auto login after registration
        const user = response.user || response.data;
        const token = response.token || response.accessToken;
        const refreshToken = response.refreshToken;
        
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        localStorage.setItem('loginTime', new Date().toISOString());
        
        setUser(user);
        navigate('/dashboard', { replace: true });
        
        return { success: true };
      }
      
      return { success: false, error: response.message || 'Registration failed' };
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.message || 'Registration failed. Please try again.';
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      // Call logout API
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API fails
    } finally {
      // Clear all auth data from localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('loginTime');
      
      // Clear user state
      setUser(null);
      
      // Redirect to login
      navigate('/login', { replace: true });
    }
  };

  const updateProfile = async (data) => {
    try {
      const response = await authAPI.updateProfile(data);
      
      if (response.success !== false) {
        const updatedUser = response.user || response.data;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { success: true };
      }
      
      return { success: false, error: response.message || 'Update failed' };
    } catch (error) {
      console.error('Update profile error:', error);
      const errorMessage = error.message || 'Update failed';
      return { success: false, error: errorMessage };
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      const response = await authAPI.changePassword(oldPassword, newPassword);
      return { success: true, message: response.message || 'Password changed successfully' };
    } catch (error) {
      console.error('Change password error:', error);
      const errorMessage = error.message || 'Password change failed';
      return { success: false, error: errorMessage };
    }
  };

  // const value = {
  //   user,
  //   login,
  //   register,
  //   logout,
  //   updateProfile,
  //   changePassword,
  //   loading,
  //   isAuthenticated: !!user,
  // };


  const value = {
  user,
  login,
  register,
  logout,
  updateProfile,
  changePassword,
  loading,
  isAuthenticated: !!user,
  
  // 🔥 RBAC - ADD THESE 👇
  userType: user?.userType,
  hasAccess: (pathname) => {
    return canAccessRoute(pathname, user?.userType);
  }
  // 🔥 RBAC - ADD THESE 👆
};


  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
