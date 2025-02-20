const API_ENDPOINTS = {
  API_BASE_URL: process.env.NEXT_PUBLIC_SERVER_URL,
  AUTH:{
    LOGIN: "/auth/login",
    SIGNUP: "/auth/signup",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },
  USERS:{
    BASE: "/users",
    UPDATE_PROFILE: "/users/",
  },
  PROJECTS:{
    BASE: "/projects",
  }
};

export default API_ENDPOINTS;
