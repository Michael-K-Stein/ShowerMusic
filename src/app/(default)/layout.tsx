'use client';
import React, { useMemo, useState } from 'react';
import { AuthProvider } from '@/app/components/auth-provider';
import { Snackbar, Theme, ThemeProvider, createTheme } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { GlobalPropsProvider } from '@/app/components/providers/global-props/global-props';

export default function StreamRootLayout({
    children,
}: {
    children: React.JSX.Element[] | React.JSX.Element | React.ReactNode | React.ReactNode[];
})
{
    const darkMode = true;
    const [ currentTheme, setCurrentTheme ] = useState<Theme>();
    useMemo(() =>
    {
        if (typeof window === 'undefined') { return; }
        setCurrentTheme(createTheme({
            palette: {
                mode: darkMode ? 'dark' : 'light',
            },
        }));
    }, [ darkMode ]);

    return (
        <ThemeProvider theme={ currentTheme ?? {} }>
            <GlobalPropsProvider>
                <AuthProvider>
                    <SnackbarProvider>
                        { children }
                    </SnackbarProvider>
                </AuthProvider>
            </GlobalPropsProvider>
        </ThemeProvider>
    );
}
