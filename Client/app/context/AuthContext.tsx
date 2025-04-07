import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  error: string | null;
  signup: (userData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => Promise<void>;
  signin: (credentials: { email: string; password: string }) => Promise<void>;
  signout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<any>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Use your computer's IP address instead of localhost
const API_URL = "http://10.240.167.206:3000/api/v1";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load stored session on app start
  useEffect(() => {
    const loadStoredSession = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error("Error loading stored session:", err);
      }
    };
    loadStoredSession();
  }, []);

  //   register user to app
  const signup = async (userData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/user/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      setUser(data);
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "An error occurred during signup");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  //   Login user to app
  const signin = async (credentials: { email: string; password: string }) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/user/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signin failed");
      }

      // Store user data in AsyncStorage
      await AsyncStorage.setItem("user", JSON.stringify(data));
      setUser(data);
    } catch (err: any) {
      console.error("Signin error:", err);
      setError(err.message || "An error occurred during signin");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Add signout function
  const signout = async () => {
    try {
      await AsyncStorage.removeItem("user");
      setUser(null);
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/user/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to process forgot password request"
        );
      }

      return data;
    } catch (err: any) {
      console.error("Forgot password error:", err);
      setError(
        err.message || "An error occurred during forgot password request"
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/user/reset-password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      // Store the new token and user data
      await AsyncStorage.setItem("user", JSON.stringify(data));
      setUser(data);
    } catch (err: any) {
      console.error("Reset password error:", err);
      setError(err.message || "An error occurred while resetting password");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        signup,
        signin,
        signout,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Add a default export to satisfy Expo Router
export default function AuthContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
