'use client';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { UserDict } from '@/app/shared-api/user-objects/users';
import { safeApiFetcher } from '@/app/client-api/common-utils';

export type AuthContextState = {
    userData?: UserDict;
};

// Create a context for the authentication state
const AuthContext = createContext<AuthContextState | undefined>(undefined);

export async function getUserMe()
{
    const response = await safeApiFetcher('/api/users/me');
    return response as UserDict;
};

// Create a provider component for the authentication state
export const AuthProvider = ({ children }: { children: React.ReactNode; }) =>
{
    const [ isLoggedIn, setIsLoggedIn ] = useState(true);
    const [ userData, setUserData ] = useState<UserDict>();

    // Check if the user is logged in when the component mounts
    useEffect(() =>
    {
        if (typeof window === 'undefined') { return; }
        async function checkIfUserIsLoggedIn()
        {
            try
            {
                const response = await getUserMe();
                setUserData(response);
                return true;
            } catch (error)
            {
                console.error('Error:', error);
                return false;
            }
        }

        const checkLogin = async () =>
        {
            const loggedIn = await checkIfUserIsLoggedIn();
            setIsLoggedIn(loggedIn);
        };

        checkLogin();
    }, [ setUserData ]);

    // Redirect the user to /login if they are not logged in
    useEffect(() =>
    {
        if (!isLoggedIn && location.pathname !== '/login')
        {
            location.pathname = '/login';
        }
    }, [ isLoggedIn ]);

    // Provide the authentication state and its setter function to the children
    return (
        <AuthContext.Provider value={ { userData } }>
            { children }
        </AuthContext.Provider>
    );
};

// Create a hook to use the auth context
export const useAuth = () =>
{
    const context = useContext(AuthContext);

    if (context === undefined)
    {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};
