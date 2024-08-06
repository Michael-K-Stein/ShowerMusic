'use client';
import React, { useMemo, useRef } from 'react';
import { ThemeProvider, createTheme } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { GlobalPropsProvider } from '@/app/components/providers/global-props/global-props';
import '@/app/globals.css';
import '@/app/fonts.css';
import { KeybindsProvider } from '@/app/components/providers/global-props/keybinds-provider';


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

interface BeforeInstallPromptEventPromptResult 
{
    outcome: 'accepted' | 'dismissed';
    playform: 'web' | 'play';
};
type BeforeInstallPromptEvent = Event & { prompt: () => Promise<BeforeInstallPromptEventPromptResult>; };

export default function GlobalProvidersRootLayout({
    children,
}: {
    children: React.ReactNode;
})
{
    const pwaInstallPrompt = useRef<BeforeInstallPromptEvent | undefined>(undefined);
    useMemo(() =>
    {
        if (typeof window === 'undefined') { return; }

        window.addEventListener('beforeinstallprompt', async (e) =>
        {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            pwaInstallPrompt.current = e as BeforeInstallPromptEvent;
            // Optionally, send analytics event that PWA install promo was shown.
            console.log(`'beforeinstallprompt' event was fired.`);
            const userChoice = await pwaInstallPrompt.current.prompt();
            console.log(userChoice);
            pwaInstallPrompt.current = undefined;
        });
    }, []);

    return (
        <ThemeProvider theme={ theme }>
            <GlobalPropsProvider>
                <SnackbarProvider>
                    <KeybindsProvider>
                        { children }
                    </KeybindsProvider>
                </SnackbarProvider>
            </GlobalPropsProvider>
        </ThemeProvider>
    );
}
