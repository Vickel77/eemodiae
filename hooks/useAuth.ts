import React, { useContext } from "react";
import AuthContext from "../context/AuthContext";

export default function useAuth() {
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);
  return { isLoggedIn, setIsLoggedIn };
}
