import { createContext, useContext } from "react";

export const AgencySessionContext = createContext(null);

export function useAgencySession() {
  const context = useContext(AgencySessionContext);
  return context;
}