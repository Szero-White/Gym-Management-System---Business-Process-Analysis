import React, { useReducer } from 'react';
import AuthContext from './authContext';
import authReducer from './authReducer';
import setAuthToken from '../../utils/setAuthToken';
import api from '../../utils/api';

import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  CLEAR_ERRORS
} from './types';

const AuthState = props => {
  const initialState = {
    token: localStorage.getItem('token'),
    isAuthenticated: null,
    loading: false,
    user: null,
    error: null
  };

  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load User
  const loadUser = async () => {
    try {
      const res = await api.get('/auth/me');

      dispatch({
        type: USER_LOADED,
        payload: res.data
      });
    } catch (err) {
      dispatch({ type: AUTH_ERROR });
    }
  };

  // Login User
  const login = async formData => {
    try {
      const res = await api.post('/auth/login', formData);
      
      dispatch({
        type: LOGIN_SUCCESS,
        payload: res.data
      });

      // Set token to localStorage and axios headers
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        setAuthToken(res.data.token);
      }

      // Load user info after successful login
      await loadUser();
    } catch (err) {
      dispatch({
        type: LOGIN_FAIL,
        payload: err.response?.data?.message || 'Đăng nhập thất bại'
      });
    }
  };

  // Register new user
  const register = async formData => {
    try {
      const res = await api.post('/auth/register', formData);
      
      dispatch({
        type: REGISTER_SUCCESS,
        payload: res.data
      });

      // Set token to localStorage and axios headers
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        setAuthToken(res.data.token);
      }

      // Load user info after successful registration
      await loadUser();
    } catch (err) {
      dispatch({
        type: REGISTER_FAIL,
        payload: err.response?.data?.message || 'Đăng ký thất bại'
      });
      throw err; // Rethrow để component có thể catch và xử lý
    }
  };

  // Logout - với callback để xử lý chuyển hướng
  const logout = (callback) => {
    // Xóa token khỏi headers
    setAuthToken(null);
    
    // Xóa token khỏi localStorage
    localStorage.removeItem('token');
    
    // Cập nhật state
    dispatch({ type: LOGOUT });
    
    // Gọi callback sau khi state đã được cập nhật
    if (callback && typeof callback === 'function') {
      callback();
    }
  };

  // Clear Errors
  const clearErrors = () => {
    dispatch({ type: CLEAR_ERRORS });
  };

  return (
    <AuthContext.Provider
      value={{
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        user: state.user,
        error: state.error,
        register,
        login,
        logout,
        loadUser,
        clearErrors
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthState;