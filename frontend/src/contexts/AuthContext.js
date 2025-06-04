import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  isAuthenticated: false,
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  LOAD_USER_START: 'LOAD_USER_START',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
      };

    case AUTH_ACTIONS.LOAD_USER_START:
      return {
        ...state,
        loading: true,
      };

    case AUTH_ACTIONS.LOAD_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload,
        error: null,
      };

    case AUTH_ACTIONS.LOAD_USER_FAILURE:
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      };

    case AUTH_ACTIONS.UPDATE_PROFILE:
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload,
        },
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set auth token for axios
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  };

  // Load user on app start
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        setAuthToken(token);
        dispatch({ type: AUTH_ACTIONS.LOAD_USER_START });
        
        try {
          const response = await axios.get('/api/auth/me');
          dispatch({
            type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
            payload: response.data.data.user,
          });
        } catch (error) {
          console.error('Load user error:', error);
          dispatch({
            type: AUTH_ACTIONS.LOAD_USER_FAILURE,
            payload: error.response?.data?.message || 'Kullanıcı bilgileri alınamadı',
          });
          // Clear invalid token
          setAuthToken(null);
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.LOAD_USER_FAILURE, payload: null });
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const response = await axios.post('/api/auth/login', credentials);
      const { user, token } = response.data.data;

      setAuthToken(token);
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      });

      toast.success('Giriş başarılı');
      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || 'Giriş yapılırken hata oluştu';
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: message,
      });

      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      if (state.token) {
        await axios.post('/api/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAuthToken(null);
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      toast.success('Başarıyla çıkış yapıldı');
    }
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/api/auth/profile', profileData);
      
      dispatch({
        type: AUTH_ACTIONS.UPDATE_PROFILE,
        payload: response.data.data,
      });

      toast.success('Profil başarıyla güncellendi');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profil güncellenirken hata oluştu';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Change password function
  const changePassword = async (passwordData) => {
    try {
      await axios.put('/api/auth/change-password', passwordData);
      toast.success('Şifre başarıyla değiştirildi');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Şifre değiştirilirken hata oluştu';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Forgot password function
  const forgotPassword = async (email) => {
    try {
      const response = await axios.post('/api/auth/forgot-password', { email });
      toast.success('Şifre sıfırlama bağlantısı email adresinize gönderildi');
      return { success: true, resetToken: response.data.resetToken };
    } catch (error) {
      const message = error.response?.data?.message || 'Şifre sıfırlama işlemi başlatılırken hata oluştu';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Reset password function
  const resetPassword = async (token, newPassword) => {
    try {
      await axios.post('/api/auth/reset-password', { token, newPassword });
      toast.success('Şifre başarıyla sıfırlandı');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Şifre sıfırlanırken hata oluştu';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Check if user has permission
  const hasPermission = (permission) => {
    if (!state.user) return false;
    if (state.user.role === 'admin') return true;
    return state.user.permissions.includes(permission);
  };

  // Check if user has role
  const hasRole = (role) => {
    if (!state.user) return false;
    return state.user.role === role;
  };

  // Check if user has minimum role level
  const hasRoleLevel = (minRole) => {
    if (!state.user) return false;
    
    const roleHierarchy = {
      viewer: 1,
      technician: 2,
      operator: 3,
      admin: 4,
    };

    const userLevel = roleHierarchy[state.user.role] || 0;
    const requiredLevel = roleHierarchy[minRole] || 0;

    return userLevel >= requiredLevel;
  };

  // Context value
  const value = {
    ...state,
    login,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    clearError,
    hasPermission,
    hasRole,
    hasRoleLevel,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Axios interceptor for handling token expiry
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem('token');
      if (token) {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        window.location.href = '/login';
        toast.error('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
      }
    }
    return Promise.reject(error);
  }
);

export default AuthContext; 