import { createContext, useContext, useEffect, useState } from "react";

import { fetchCurrentUser, loginOwner, logoutOwner } from "../services/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetchCurrentUser()
      .then((currentUser) => {
        if (active) {
          setUser(currentUser);
          setStatus("authenticated");
        }
      })
      .catch(() => {
        if (active) {
          setUser(null);
          setStatus("anonymous");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function signIn(email, password) {
    setError("");
    try {
      const currentUser = await loginOwner(email, password);
      setUser(currentUser);
      setStatus("authenticated");
      return currentUser;
    } catch (loginError) {
      setError(loginError.message);
      throw loginError;
    }
  }

  async function signOut() {
    await logoutOwner();
    setUser(null);
    setStatus("anonymous");
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        error,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider.");
  return context;
}
