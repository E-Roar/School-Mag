import { createContext, useContext, useState } from "react";

export const LevaSettingsContext = createContext(null);

export const LevaSettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({});
    return (
        <LevaSettingsContext.Provider value={{ settings, setSettings }}>
            {children}
        </LevaSettingsContext.Provider>
    );
};

export const useLevaSettings = () => useContext(LevaSettingsContext);
