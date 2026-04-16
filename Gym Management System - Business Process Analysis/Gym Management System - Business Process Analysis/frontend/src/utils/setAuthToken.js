import api from './api';

const setAuthToken = token => {
  if (token) {
    // Đặt token vào headers và localStorage
    api.defaults.headers.common['x-auth-token'] = token;
    localStorage.setItem('token', token);
  } else {
    // Xóa token khỏi headers và localStorage
    delete api.defaults.headers.common['x-auth-token'];
    localStorage.removeItem('token');
  }
};

export default setAuthToken;