import React, { createContext, useContext, ReactNode, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import * as AuthSession from "expo-auth-session";

const AUTH0_DOMAIN = "auth.spiritbulb.com";
const AUTH0_CLIENT_ID = "ZMurQ8PlcR9R3fCdAzpTKvumbD2X63Vu";
const SECURE_STORE_KEY = "auth_token";

interface AuthUser {
  email: string;
  name: string;
  picture?: string;
}

interface GlobalContextType {
  isLogged: boolean;
  user: AuthUser | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

interface GlobalProviderProps {
  children: ReactNode;
}

export const GlobalProvider = ({ children }: GlobalProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Move useAutoDiscovery inside the component
  const discovery = AuthSession.useAutoDiscovery(`https://${AUTH0_DOMAIN}`);

  // Ensure discovery is valid before using it
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: AUTH0_CLIENT_ID,
      redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),
      responseType: "token",
      scopes: ["openid", "profile", "email"],
    },
    discovery ?? undefined
  );

  useEffect(() => {
    const loadStoredAuth = async () => {
      setLoading(true);
      try {
        const token = await SecureStore.getItemAsync(SECURE_STORE_KEY);
        if (token) {
          const userInfo = await fetchUserInfo(token);
          if (userInfo) {
            setUser(userInfo);
          }
        }
      } catch (error) {
        console.error("Error loading stored authentication:", error);
      }
      setLoading(false);
    };
    loadStoredAuth();
  }, []);

  useEffect(() => {
    if (response?.type === "success" && response.params.access_token) {
      (async () => {
        await handleLoginSuccess(response.params.access_token);
      })();
    }
  }, [response]);

  const handleLoginSuccess = async (token: string) => {
    try {
      await SecureStore.setItemAsync(SECURE_STORE_KEY, token);
      const userInfo = await fetchUserInfo(token);
      if (userInfo) {
        setUser(userInfo);
      }
    } catch (error) {
      console.error("Login error:", error);
    }
    setLoading(false);
  };

  const fetchUserInfo = async (token: string) => {
    try {
      const response = await fetch(`https://${AUTH0_DOMAIN}/userinfo`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch user info");

      const data = await response.json();
      if (!data || typeof data !== "object") {
        throw new Error("Invalid user info response");
      }

      return data;
    } catch (error) {
      console.error("Error fetching user info:", error);
      return null;
    }
  };

  const login = async () => {
    if (request) {
      await promptAsync();
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await SecureStore.deleteItemAsync(SECURE_STORE_KEY);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
    setLoading(false);
  };

  return (
    <GlobalContext.Provider value={{ isLogged: !!user, user, loading, login, logout }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = (): GlobalContextType => {
  const context = useContext(GlobalContext);
  if (!context) throw new Error("useGlobalContext must be used within a GlobalProvider");
  return context;
};

export default GlobalProvider;
