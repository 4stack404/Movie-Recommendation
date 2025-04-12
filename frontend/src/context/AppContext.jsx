import { createContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export const AppContent = createContext();

export const AppContextProvider = ({ children }) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [isLoggedin, setIsLoggedin] = useState(false);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        if (isLoggedin && !userData) {
            getUserData();
        }
    }, [isLoggedin, userData]);

    const getUserData = async () => {
        try {
            const res = await fetch('/api/user/data', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json'
                }
            });
            const data = await res.json();

            if (data.success) {
                setUserData(data.userData);
                setIsLoggedin(true);
                return data.userData;
            } else {
                setIsLoggedin(false);
                setUserData(null);
                toast.error(data.message || 'Failed to fetch user data');
                return null;
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            setIsLoggedin(false);
            setUserData(null);
            toast.error('Failed to fetch user data');
            return null;
        }
    };

    return (
        <AppContent.Provider value={{ 
            isLoggedin, 
            setIsLoggedin, 
            userData, 
            setUserData, 
            getUserData 
        }}>
            {children}
        </AppContent.Provider>
    );
};
