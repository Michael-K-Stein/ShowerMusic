'use client';
import React, { } from 'react';
import { ThemeProvider, createTheme } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { GlobalPropsProvider } from '@/app/components/providers/global-props/global-props';
import '@/app/globals.css';
import '@/app/fonts.css';


const sfFonts = [
    "SFPro",
    "SFProItalic",
    "SFHebrew",
    "SFHebrewRounded",
];

const theme = createTheme({
    typography: {
        fontFamily: sfFonts.join(','),
    },
    palette: {
        mode: 'dark',
    }
});

export default function GlobalProvidersRootLayout({
    children,
}: {
    children: React.ReactNode;
})
{
    return (
        <ThemeProvider theme={ theme }>
            <GlobalPropsProvider>
                <SnackbarProvider>
                    { children }
                </SnackbarProvider>
            </GlobalPropsProvider>
        </ThemeProvider>
    );
}
