import React from 'react';
import { AuthProvider } from '@/app/components/auth-provider';

export default function StreamRootLayout({
    children,
}: {
    children: React.JSX.Element[] | React.JSX.Element | React.ReactNode | React.ReactNode[]
}) {
    return (
        <AuthProvider>
            { children }
        </AuthProvider>
    );
}
