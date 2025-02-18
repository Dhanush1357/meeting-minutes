const API_ENDPOINTS = {
  API_BASE_URL: "http://localhost:8000",
  AUTH:{
    LOGIN: "/auth/login",
    SIGNUP: "/auth/signup",
    FORGOT_PASSWORD: "/auth/forgot-password",
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
