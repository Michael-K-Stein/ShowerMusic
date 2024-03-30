'use client';
import React, { useMemo, useState } from 'react';
import { Theme, ThemeProvider, createTheme } from '@mui/material';
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
});

export default function GlobalProvidersRootLayout({
    children,
}: {
    children: React.ReactNode;
})
{
    const darkMode = true;
    const [ currentTheme, setCurrentTheme ] = useState<Theme>(theme);
    useMemo(() =>
    {
        if (typeof window === 'undefined') { return; }
        setCurrentTheme(createTheme(theme, {
            palette: {
                mode: darkMode ? 'dark' : 'light',
            },
        }));
    }, [ darkMode ]);

    return (
        <ThemeProvider theme={ currentTheme ?? {} }>
            <GlobalPropsProvider>
                <SnackbarProvider>
                    { children }
                </SnackbarProvider>
            </GlobalPropsProvider>
        </ThemeProvider>
    );
}
