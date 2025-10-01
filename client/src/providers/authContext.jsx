import { createContext, useState, useEffect } from "react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { user, isLoading, isAuthenticated } = useKindeAuth();

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
