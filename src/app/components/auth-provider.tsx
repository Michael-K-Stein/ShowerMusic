'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import assert from 'assert';
import { UserId } from '@/app/shared-api/user-objects/users';
import { ClientApiError, safeApiFetcher } from '@/app/client-api/common-utils';

type AuthContextState = {
    isDefault: boolean;
    isLoggedIn: boolean;
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
};

// Create a context for the authentication state
const AuthContext = createContext<AuthContextState>({
    isDefault: true,
    isLoggedIn: false,
    setIsLoggedIn: () => { },
});

export async function getUserMe()
{
    const response = await safeApiFetcher('/api/users/me');
    if (response === false)
    {
        throw new Error('Network response was not ok');
    }

    const data = response;

    const parsedData: {
        _id: UserId,
        username: string,
        playingNextTracks: never[],
        friends: any[];
    } = data;
    const { _id: userId, ...rest } = parsedData;
    const newData = { userId, ...rest };

    return newData;
};

// Create a provider component for the authentication state
export const AuthProvider = ({ children }: { children: React.JSX.Element[] | React.JSX.Element | React.ReactNode | React.ReactNode[]; }) =>
{
    const [ isLoggedIn, setIsLoggedIn ] = useState(true);

    // Check if the user is logged in when the component mounts
    useEffect(() =>
    {
        async function checkIfUserIsLoggedIn()
        {
            try
            {
                const response = await safeApiFetcher('/api/users/me');
                assert(response !== true);

                if (response === false)
                {
                    return false;
                }

                return true;
            } catch (error)
            {
                console.error('Error:', error);
                return false;
            }
        }

        // Replace this with your actual login check
        const checkLogin = async () =>
        {
            const loggedIn = await checkIfUserIsLoggedIn();
            setIsLoggedIn(loggedIn);
        };

        checkLogin();
    }, []);

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
        <AuthContext.Provider value={ { isDefault: false, isLoggedIn, setIsLoggedIn } }>
            { children }
        </AuthContext.Provider>
    );
};

// Create a hook to use the auth context
export const useAuth = () =>
{
    const context = useContext(AuthContext);

    if (context.isDefault)
    {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};
