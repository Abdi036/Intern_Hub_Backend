import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Add custom error types
interface ApiError extends Error {
  status?: number;
  data?: any;
}

interface NetworkError extends Error {
  isNetworkError: boolean;
}

interface signinResponse {
  data: {
    name: string;
    email: string;
    role: string;
  };
}

// Add error handling utility functions
const handleApiError = async (response: Response): Promise<never> => {
  let errorMessage = "An error occurred";
  let errorData;

  try {
    errorData = await response.json();
    errorMessage = errorData.message || errorData.error || errorMessage;
  } catch (e) {
    errorMessage = `HTTP error! status: ${response.status}`;
  }

  const error: ApiError = new Error(errorMessage);
  error.status = response.status;
  error.data = errorData;
  throw error;
};

// Add network error handling utility
const handleNetworkError = (error: any): never => {
  if (error.message === "Network request failed") {
    const networkError: NetworkError = new Error(
      "Unable to connect to the server. Please check your internet connection and try again."
    ) as NetworkError;
    networkError.isNetworkError = true;
    throw networkError;
  }
  throw error;
};

interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  signup: (userData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => Promise<void>;
  signin: (credentials: {
    email: string;
    password: string;
  }) => Promise<signinResponse>;
  signout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<any>;
  resetPassword: (token: string, password: string) => Promise<void>;
  updateProfile: (formData: FormData) => Promise<void>;
  UpdatePassword: (currentPassword: string, password: string) => Promise<void>;
  deleteProfile: () => Promise<void>;
  ViewAllInternships: (page?: number, queryParams?: string) => Promise<any>;
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
  GetAllMypostedinterships: () => Promise<any>;
  ViewMyPostedInternship: (id: string) => Promise<any>;
  EditMyPostedInternship: (id: string, data: any) => Promise<any>;
  DeleteMyPostedInternship: (id: string) => Promise<any>;
  GetAllApplicants: (id: string) => Promise<any>;
  GetApplicantDetail: (id: string, studentId: string) => Promise<any>;
  UpdateApplicationStatus: (
    applicationId: string,
    status: string
  ) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = "https://intern-hub-server.onrender.com/api/v1";

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
        setError("Failed to load stored session");
      }
    }
    loadStoredSession();
  }, []);

  // Generic error handler for all API calls
  const handleError = (err: any) => {
    if (err.isNetworkError) {
      setError(
        "Network error. Please check your internet connection and try again."
      );
    } else if (err.message.includes("Network request failed")) {
      setError(
        "Unable to connect to the server. Please check your internet connection and try again."
      );
    } else {
      setError(err.message || "An unexpected error occurred");
    }
    throw err;
  };

  // register user to app
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

      if (!response.ok) {
        await handleApiError(response);
      }

      const data = await response.json();
      setUser(data);
    } catch (err: any) {
      return handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Login user to app
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
      }).catch(handleNetworkError);

      if (!response.ok) {
        await handleApiError(response);
      }

      const data = await response.json();

      // Store user data in AsyncStorage
      await AsyncStorage.setItem("user", JSON.stringify(data));
      setUser(data);
      return data;
    } catch (err: any) {
      return handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // signout user from the app and set the session to null
  const signout = async () => {
    try {
      await AsyncStorage.removeItem("user");
      setUser(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setError(null);
    }
  };

  // forgot password to trigger token sending to email
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

      if (!response.ok) {
        await handleApiError(response);
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      return handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // reset password using the token sent to email
  // and the new password
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

      if (!response.ok) {
        await handleApiError(response);
      }

      const data = await response.json();
      await AsyncStorage.setItem("user", JSON.stringify(data));
      setUser(data);
    } catch (err: any) {
      return handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // update user profile
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

      if (!response.ok) {
        await handleApiError(response);
      }

      const data = await response.json();
      await AsyncStorage.setItem("user", JSON.stringify(data));
      setUser(data);
    } catch (err: any) {
      return handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // user can update/change password
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

      if (!response.ok) {
        await handleApiError(response);
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      return handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  //user can delete their account
  const deleteProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/user/delete-me`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      if (response.status === 204) {
        return { message: "Profile deleted successfully." };
      }

      const data = await response.json();
      await AsyncStorage.removeItem("user");
      setUser(null);
      return data;
    } catch (err: any) {
      return handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // students and admin can View all internships
  const ViewAllInternships = async (page = 1, queryParams = "") => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(
        `${API_URL}/internships?page=${page}${
          queryParams ? `&${queryParams}` : ""
        }`,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      if (!response.ok) {
        await handleApiError(response);
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      return handleError(err);
    } finally {
      setIsLoading(false);
      setError(null);
    }
  };

  // student can View internship details (get internshipByID)
  const ViewInternship = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/internships/${id}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      return handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // admin can delete internship
  const DeleteInternship = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/admin/internships/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      return handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // student can Apply For internship
  const ApplyInternship = async (
    internshipId: string,
    applicationData: FormData
  ) => {
    try {
      setIsLoading(true);
      setError(null);
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit application");
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // student can view their applications
  const ViewApplications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/internships/my-applications`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const data = await response.json();
      return data.applications || data;
    } catch (err: any) {
      return handleError(err);
    } finally {
      setIsLoading(false);
    }
  };
  // student can view specific application detail
  const ApplicationDetail = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/internships/${id}/application`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const data = await response.json();
      return data.applications || data;
    } catch (err: any) {
      return handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Student can delete their application
  const DeleteApplication = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
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

      if (!response.ok) {
        await handleApiError(response);
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      return handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Admin can view all users
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

      if (!response.ok) {
        await handleApiError(response);
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      return handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Admin can delete users
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

      if (!response.ok) {
        await handleApiError(response);
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      return handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Note: I have not implemented the Postinternship Api integration in this file.

  // Company can see all their posted internships
  const GetAllMypostedinterships = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(
        `${API_URL}/internships/allMypostedInterships`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      if (!response.ok) {
        await handleApiError(response);
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      return handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Company can see their specific internship details
  const ViewMyPostedInternship = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/internships/posted/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      return handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Company can edit their posted internship
  const EditMyPostedInternship = async (id: string, data: any) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/internships/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const responseData = await response.json();
      return responseData;
    } catch (err: any) {
      return handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Company can delete their posted internship
  const DeleteMyPostedInternship = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/internships/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      // Handle 204 No Content response
      if (response.status === 204) {
        return { message: "Internship deleted successfully" };
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      return handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // company can see all applicants for their internship
  const GetAllApplicants = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/internships/${id}/applicants`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      return handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // company can see specific applicant details
  // for their internship
  const GetApplicantDetail = async (id: string, studentId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(
        `${API_URL}/internships/${id}/applicants/${studentId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user?.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        await handleApiError(response);
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      return handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // company can update the status of an applicant (accept/reject)
  // for their internship
  const UpdateApplicationStatus = async (
    applicationId: string,
    status: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(
        `${API_URL}/internships/update-application-status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${user?.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            applicationId,
            status,
          }),
        }
      );

      if (!response.ok) {
        await handleApiError(response);
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      return handleError(err);
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
        setError,
        setIsLoading,
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
        GetAllMypostedinterships,
        ViewMyPostedInternship,
        EditMyPostedInternship,
        DeleteMyPostedInternship,
        GetAllApplicants,
        GetApplicantDetail,
        UpdateApplicationStatus,
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
