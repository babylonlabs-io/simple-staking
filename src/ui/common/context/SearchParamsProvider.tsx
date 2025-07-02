import { createContext, useContext } from "react";

const Context = createContext(new URLSearchParams(window.location.search));

export const useSearchParams = () => useContext(Context);
