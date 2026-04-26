import { createContext, useContext } from "react";

export const AdminSessionContext = createContext(null);

export function useAdminSession() {
  const context = useContext(AdminSessionContext);
  return context;
}