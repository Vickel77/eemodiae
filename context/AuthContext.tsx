import React, { Children, ReactNode, createContext, useState } from "react";

const AuthContext = createContext<{
  isLoggedIn: boolean;
  setIsLoggedIn: any;
}>({
  isLoggedIn: false,
  setIsLoggedIn: () => null,
});

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
