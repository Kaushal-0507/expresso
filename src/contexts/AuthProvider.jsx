import { useContext, useEffect } from "react";
import { createContext } from "react";
import { loginService, signUpService, checkAuthService } from "../services/authServices";
import { useReducer } from "react";
import { authReducer } from "../reducers/authReducer";
import { AUTH } from "../common/reducerTypes";
import { toast } from "react-hot-toast";

const AuthContext = createContext();

// Get initial state from localStorage if it exists
const getInitialState = () => {
  const savedUser = localStorage.getItem("user");
  const token = localStorage.getItem("token");
  if (savedUser && token) {
    return {
      ...JSON.parse(savedUser),
      isLoggedIn: true,
    };
  }
  return {
    user: {
      userDetails: {},
      token: "",
    },
    isLoggedIn: false,
  };
};

export default function AuthProvider({ children }) {
  const [userData, authDispatch] = useReducer(authReducer, getInitialState());

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await checkAuthService();
          if (response.status === 200) {
            const userData = {
              user: {
                userDetails: response.data,
                token: token,
              },
              isLoggedIn: true,
            };
            localStorage.setItem("user", JSON.stringify(userData));
            authDispatch({
              type: AUTH.SIGN_IN,
              payload: {
                foundUser: response.data,
                encodedToken: token,
              },
            });
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        authDispatch({ type: AUTH.SIGN_OUT });
      }
    };

    checkAuth();
  }, []);

  // Persist user data to localStorage whenever it changes
  useEffect(() => {
    if (userData.isLoggedIn) {
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", userData.user.token);
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }, [userData]);

  const signUp = async (creds) => {
    try {
      const request = await signUpService(creds);
      const { createdUser, encodedToken } = request.data;
      if (request.status === 201) {
        authDispatch({
          type: AUTH.SIGN_UP,
          payload: { createdUser, encodedToken },
        });
        toast.success("Account created successfully!");
      }
    } catch (error) {
      console.error(error);
      if (error.response?.status === 422) {
        toast.error("User already exists! Do you want to login instead?");
      } else {
        toast.error("Something went wrong!");
      }
    }
  };

  const signIn = async (creds) => {
    try {
      const request = await loginService(creds);
      const { foundUser, encodedToken } = request.data;
      if (request.status === 200) {
        authDispatch({
          type: AUTH.SIGN_IN,
          payload: { foundUser, encodedToken },
        });
        toast.success("Logged in successfully!");
      }
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401) {
        toast.error("Invalid Email or Password entered!");
      } else if (error.response?.status === 404) {
        toast.error("User not found. Please Sign Up first!");
      } else {
        toast.error("Something went wrong!");
      }
    }
  };

  const signOut = async () => {
    authDispatch({ type: AUTH.SIGN_OUT });
    toast.success("Logged out successfully!");
  };

  return (
    <AuthContext.Provider
      value={{
        userData,
        signIn,
        signUp,
        signOut,
        authDispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
