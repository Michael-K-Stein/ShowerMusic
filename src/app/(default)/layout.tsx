'use client';
import React from 'react';
import { AuthProvider } from '@/app/components/auth-provider';
import { Snackbar } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { GlobalPropsProvider } from '@/app/components/providers/global-props/global-props';

export default function StreamRootLayout({
    children,
}: {
    children: React.JSX.Element[] | React.JSX.Element | React.ReactNode | React.ReactNode[];
})
{
    return (
        <GlobalPropsProvider>
            <AuthProvider>
                <SnackbarProvider>
                    { children }
                </SnackbarProvider>
            </AuthProvider>
        </GlobalPropsProvider>
    );
}
