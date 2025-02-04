import React, { createContext, useContext, ReactNode } from "react";

import { getCurrentUser } from "./appwrite";
import { useAppwrite } from "./useAppwrite";
import { Redirect } from "expo-router";
import { Account, Query } from "react-native-appwrite";
import { ImageComponent } from "react-native";
import { Descriptor, ParamListRoute } from "@react-navigation/native";

interface GlobalContextType {
  isLogged: boolean;
  user: any;
  loading: boolean;
  refetch: Function;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

interface GlobalProviderProps {
  children: ReactNode;
}

export const GlobalProvider = ({ children }: GlobalProviderProps) => {
  const {
    data: user,
    loading,
    refetch,
  } = useAppwrite({
    fn: getCurrentUser,
  });

  const isLogged = !!user;


  return (
    <GlobalContext.Provider value={{
        isLogged,
        loading,
        user,
        refetch,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = (): GlobalContextType => {
  const context = useContext(GlobalContext);
  if (!context)
    throw new Error("useGlobalContext must be used within a GlobalProvider");

  return context;
};

export default GlobalProvider;
