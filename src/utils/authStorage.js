const AUTH_KEYS = [
  'user',
  'token',
  'authToken',
  'accessToken',
  'refreshToken',
  'email',
  'password',
  'credentials',
  'rememberMe',
  'edusync.auth',
  'edusync.user',
  'edusync.token',
  'edusync.credentials'
];

export const clearAuthStorage = () => {
  AUTH_KEYS.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};
