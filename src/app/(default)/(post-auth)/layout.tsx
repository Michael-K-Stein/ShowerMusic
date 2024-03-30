'use client';
import React from 'react';
import { AuthProvider } from '@/app/components/auth-provider';

export default function PostAuthRootLayout({
    children,
}: {
    children: React.ReactNode;
})
{

    return (
        <AuthProvider>
            { children }
        </AuthProvider>
    );
}
