import api from "../utils/axios";

export const loginService = async (creds) => {
  try {
    const response = await api.post("/api/auth/login", creds);
    return response;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const signUpService = async (creds) => {
  try {
    const response = await api.post("/api/auth/register", creds);
    return response;
  } catch (error) {
    console.error("Signup error:", error);
    throw error;
  }
};

export const checkAuthService = async () => {
  try {
    const response = await api.get("/api/auth/check");
    return response;
  } catch (error) {
    console.error("Auth check error:", error);
    throw error;
  }
};

export const logoutService = async () => {
  try {
    const response = await api.post("/api/auth/logout");
    return response;
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};
