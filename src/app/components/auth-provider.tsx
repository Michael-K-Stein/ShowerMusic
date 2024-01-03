'use client'
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

type AuthContextState = {
    isLoggedIn: boolean;
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
};

// Create a context for the authentication state
const AuthContext = createContext<AuthContextState>({
    isLoggedIn: false,
    setIsLoggedIn: () => { },
});

export async function getUserMe()
{
    const response = await fetch('/api/users/me');
    if (!response.ok)
    {
        throw new Error('Network response was not ok');
    }

    const data = await response.json();

    const parsedData : {
        _id: string,
        username: string,
        playingNextTracks: never[],
        friends: any[]
    } = data;
    const { _id: userId, ...rest } = parsedData;
    const newData = { userId, ...rest };

    return newData;
};

// Create a provider component for the authentication state
export const AuthProvider = ({ children } : { children: React.JSX.Element[] | React.JSX.Element | React.ReactNode | React.ReactNode[] }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(true);

    // Check if the user is logged in when the component mounts
    useEffect(() => {
        async function checkIfUserIsLoggedIn() {
            try {
                const response = await fetch('/api/users/me');
        
                if (!response.ok && response.status != 403) {
                    throw new Error('Network response was not ok');
                }
        
                if (response.status === 403)
                {
                    return false;
                }

                if (response.status === 200)
                {
                    return true;
                }

                throw new Error('Unexpected response status!');
            } catch (error) {
                console.error('Error:', error);
                return false;
            }
        }        

        // Replace this with your actual login check
        const checkLogin = async () => {
            const loggedIn = await checkIfUserIsLoggedIn();
            setIsLoggedIn(loggedIn);
        };

        checkLogin();
    }, []);

    // Redirect the user to /login if they are not logged in
    useEffect(() => {
        if (!isLoggedIn && location.pathname !== '/login') {
            location.pathname = '/login';
        }
    }, [isLoggedIn]);

    // Provide the authentication state and its setter function to the children
    return (
        <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
            {children}
        </AuthContext.Provider>
    );
};

// Create a hook to use the auth context
export const useAuth = () => useContext(AuthContext);
