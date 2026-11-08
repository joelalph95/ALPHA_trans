import React, { createContext, useMemo, useState } from 'react';

export const AuthContext = createContext({
  user: null,
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const value = useMemo(
    () => ({
      user,
      signIn: async (_payload) => {
        // TODO: implement
        setUser({});
      },
      signOut: async () => {
        // TODO: implement
        setUser(null);
      },
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

