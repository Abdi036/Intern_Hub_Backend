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
  updateProfile: (formData: FormData) => Promise<void>;
  UpdatePassword: (currentPassword: string, password: string) => Promise<void>;
  deleteProfile: () => Promise<void>;
  ViewAllInternships: (page?: number) => Promise<any>;
  ViewInternship: (id: string) => Promise<any>;
  ApplyInternship: (
    internshipId: string,
    applicationData: FormData
  ) => Promise<any>;
  ViewApplications: () => Promise<any>;
  DeleteInternship: (id: string) => Promise<any>;
  ApplicationDetail: (id: string) => Promise<any>;
  DeleteApplication: (id: string) => Promise<void>;
  ViewUsers: () => Promise<any>;
  DeleteUsers: (userId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = "http://192.168.43.5:3000/api/v1";
// const API_URL = "http://10.240.163.41:3000/api/v1";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load stored session on app start
  useEffect(() => {
    async function loadStoredSession() {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error("Error loading stored session:", err);
      }
    }
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

  const updateProfile = async (formData: FormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/user/update-me`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      // Save updated user data
      await AsyncStorage.setItem("user", JSON.stringify(data));
      setUser(data);
    } catch (error: any) {
      setError(error.message || "An error occurred while updating profile");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const UpdatePassword = async (currentPassword: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/user/update-password`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update password");
      }

      return data;
    } catch (error: any) {
      setError(error.message || "An error occurred while updating password");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProfile = async () => {
    try {
      setError(null);

      const response = await fetch(`${API_URL}/user/delete-me`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (response.status === 204) {
        return { message: "Profile deleted successfully." };
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete profile");
      }

      // Clear user data from AsyncStorage
      await AsyncStorage.removeItem("user");
      setUser(null);

      return data;
    } catch (error: any) {
      setError(error.message || "An error occurred while deleting profile");
      throw error;
    }
  };

  // View all internships
  const ViewAllInternships = async (page = 1) => {
    try {
      const response = await fetch(`${API_URL}/internships?page=${page}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to view internships");
      }

      return data;
    } catch (error: any) {
      console.error("View internship error:", error);
      throw error;
    }
  };

  // View internship by id
  const ViewInternship = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/internships/${id}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to view internship");
      }
      return data;
    } catch (error: any) {
      console.error("View internship error:", error);
      setError(error.message || "An error occurred while viewing internship");
      throw error;
    }
  };

  const DeleteInternship = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/admin/internships/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete internship");
      }
      return data;
    } catch (error: any) {
      setError(error.message || "An error occurred while deleting internship");
      throw error;
    }
  };
  // Apply For internship
  const ApplyInternship = async (
    internshipId: string,
    applicationData: FormData
  ) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${API_URL}/internships/${internshipId}/apply`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
          body: applicationData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to apply to internship");
      }

      return data;
    } catch (error: any) {
      console.error("Apply internship error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // student can view their applications
  const ViewApplications = async () => {
    try {
      const response = await fetch(`${API_URL}/internships/my-applications`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to view applications");
      }

      return data.applications || data;
    } catch (error) {
      console.error("View applications error:", error);
      throw error;
    }
  };
  // student can view specific application detail
  const ApplicationDetail = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/internships/${id}/application`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to view applications");
      }

      return data.applications || data;
    } catch (error) {
      console.error("View applications error:", error);
      throw error;
    }
  };

  // Student can delete their application
  const DeleteApplication = async (id: string) => {
    try {
      const response = await fetch(
        `${API_URL}/internships/${id}/delete-application`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
    } catch (error: any) {
      console.error("Delete application error:", error);
      setError(error.message || "An error occurred while deleting application");
      throw error;
    }
  };
  const ViewUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/admin/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      });
      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error("View users error:", error);
      setError(error.message || "An error occurred while viewing users");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const DeleteUsers = async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      });
    } catch (error: any) {
      setError(error.message || "An error occurred while deleting user");
      throw error;
    } finally {
      setIsLoading(false);
    }
    return true;
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
        updateProfile,
        UpdatePassword,
        deleteProfile,
        ViewAllInternships,
        DeleteInternship,
        ViewInternship,
        ApplyInternship,
        ViewApplications,
        ApplicationDetail,
        DeleteApplication,
        ViewUsers,
        DeleteUsers,
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

export default function AuthContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
