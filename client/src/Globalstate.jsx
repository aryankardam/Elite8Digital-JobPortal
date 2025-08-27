import React, { createContext, useState } from "react";
import JobAPI from "./JobAPI";

export const GlobalState = createContext();

export const DataProvider = ({ children }) => {
  const [token, setToken] = useState("");

  const state = {
    token: [token, setToken],
    JobAPI: JobAPI(),
  };

  return (
    <GlobalState.Provider value={state}>
      {children}
    </GlobalState.Provider>
  );
};
