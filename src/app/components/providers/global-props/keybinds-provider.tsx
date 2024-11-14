'use client';
import { Box, Button, Typography } from "@mui/material";
import assert from "assert";
import { useSnackbar } from "notistack";
import { createContext, KeyboardEventHandler, useCallback, useContext, useMemo, useRef, useState } from "react";
import './keybinds.css';

export const ALT_KEY_DOWN_TIMEOUT = 1.800;
export type PureKeybind = string;
export type KeybindRegistrationOptions = { ctrl: boolean, shift: boolean, alt: boolean; };
export type KeybindClickCallback = (keybind: PureKeybind) => Promise<void>;
export type KeybindRegistration = { keybind: PureKeybind, callback: KeybindClickCallback, options?: KeybindRegistrationOptions; };
export type RegisterKeybindRemoveHandler = () => void;
export type RegisterKeybind = ({ keybind, callback, options }: KeybindRegistration) => RegisterKeybindRemoveHandler;
export enum KeybindHintState
{
    Visible,
    Hidden,
    ImportantOnly,
};
type RegisteredKeybinds = { [ x: PureKeybind ]: Array<KeybindRegistration> | undefined; };
type KeybindsContextType = {
    isDefault: boolean;
    registerKeybind: RegisterKeybind;
    keybindHintsState: KeybindHintState;
    showKeybindInfo: () => void;
};

export const KeybindsContext = createContext<KeybindsContextType>(
    {
        isDefault: true,
        registerKeybind: () => { return () => { }; },
        keybindHintsState: KeybindHintState.ImportantOnly,
        showKeybindInfo: () => { },
    }
);

export const KeybindsProvider = ({ children }: { children: React.JSX.Element[] | React.JSX.Element | React.ReactNode; }) =>
{
    const { enqueueSnackbar } = useSnackbar();
    const registeredKeybinds = useRef<RegisteredKeybinds>({});
    const [ keybindHintsState, setKeybindsHintsState ] = useState<KeybindHintState>(KeybindHintState.ImportantOnly);
    const altKeyDownStartTimeRef = useRef<number | null>(null);

    const appendKeybind = useCallback((keybind: PureKeybind, registration: KeybindRegistration) =>
    {
        const currentKeybinds = registeredKeybinds.current;
        if (!currentKeybinds || typeof currentKeybinds === 'undefined') { return; }
        if (!(keybind in currentKeybinds)) { currentKeybinds[ keybind ] = []; }
        assert(currentKeybinds);
        assert(typeof currentKeybinds === 'object');
        const keybindingsArray = currentKeybinds[ keybind ];
        assert(Array.isArray(keybindingsArray));
        // Not sure why the compiler is yelling at me, but apparently it is not convinced that this is an array
        if (!Array.isArray(keybindingsArray)) { throw TypeError(`Expected "Array" but got ${keybindingsArray} instead!`); }
        keybindingsArray.push(registration);
    }, []);

    const registerKeybind: RegisterKeybind = useCallback((
        registration: KeybindRegistration
    ) =>
    {
        const { keybind } = registration;
        appendKeybind(keybind, registration);
        return () =>
        { // Return a cleanup function to remove the handler
            const capturedKeybindsArray = registeredKeybinds.current[ keybind ];
            assert(capturedKeybindsArray);
            if (!registeredKeybinds.current || !capturedKeybindsArray) { return; }
            registeredKeybinds.current[ keybind ] = capturedKeybindsArray.filter(h => h !== registration);
        };
    }, [ appendKeybind ]);

    useMemo(() =>
    {
        if (typeof document === 'undefined' || !document || !document.body) { return; }
        if (keybindHintsState === KeybindHintState.Visible)
        {
            document.body.setAttribute('access-key-visible', 'true');
        }
        else
        {
            document.body.setAttribute('access-key-visible', 'false');
        }
    }, [ keybindHintsState ]);

    const listAllKeybinds = useCallback(() =>
    {
        const ACCESSKEY_MAGIC_KEYBIND = getUserAgentAccessKey();

        const KEYBINDS = [
            { keybind: '/', description: 'Focus on the search bar', },
            { keybind: 'Q', description: 'Toggle the queue\'s visibility', },
            { keybind: 'L', description: 'Show the lyrics of the currently playing track', },
            { keybind: 'P', description: 'Play / Pause current track', },
        ];

        const keybindComponents = KEYBINDS.map(
            (keybindData) =>
                <>
                    <Typography fontWeight={ 700 }>{ ACCESSKEY_MAGIC_KEYBIND } + { keybindData.keybind }</Typography>
                    <Box />
                    <Typography fontWeight={ 500 }>{ keybindData.description }</Typography>
                </>
        );

        enqueueSnackbar(
            <div className="grid grid-cols-[auto_1rem_1fr]">
                { keybindComponents }
            </div>,
            { variant: 'info', autoHideDuration: 60000 });
    }, [ enqueueSnackbar ]);

    const showKeybindInfo = useCallback(() =>
    {
        enqueueSnackbar(
            <div className="flex flex-col items-center justify-center">
                <Typography>Try &quot;{ getUserAgentAccessKey() } + /&quot; or &quot;Shift + ?&quot; to set focus on the search bar</Typography>
                <div className="grid grid-cols-2 grid-rows-2">
                    <Button variant="outlined" disableElevation onClick={ () => listAllKeybinds() }>List all keybinds</Button>
                    <Button variant="outlined" disableElevation onClick={ () => setKeybindsHintsState(KeybindHintState.ImportantOnly) }>Important only</Button>
                    <Button variant="outlined" disableElevation onClick={ () => setKeybindsHintsState(KeybindHintState.Visible) }>Show all keybind hints</Button>
                    <Button variant="outlined" disableElevation onClick={ () => setKeybindsHintsState(KeybindHintState.Hidden) }>Hide all keybind hints</Button>
                </div>
                <Typography fontSize={ '0.8rem' }>* Keybindings may differ between browsers and OS platforms</Typography>
            </div>,
            { variant: 'info', autoHideDuration: 15000 });
    }, [ listAllKeybinds, enqueueSnackbar ]);

    const keyUpHandler: KeyboardEventHandler<HTMLDivElement> = useCallback((e) =>
    {
        const handlers = registeredKeybinds.current[ e.key ];
        if (!handlers) { return; }
        handlers.map((v) =>
        {
            if (v.options && (
                v.options.alt !== e.altKey ||
                v.options.ctrl !== e.ctrlKey ||
                v.options.shift !== e.shiftKey
            )) { return; }
            v.callback(e.key);
        });

        if (e.key === getUserAgentAccessKey())
        {
            altKeyDownStartTimeRef.current = null;
        }
    }, [ registeredKeybinds ]);

    const keyDownHandler = useCallback((e: React.KeyboardEvent<HTMLDivElement>) =>
    {
        if (e.key === getUserAgentAccessKey())
        {
            if (altKeyDownStartTimeRef.current === 0 || altKeyDownStartTimeRef.current === null)
            {
                altKeyDownStartTimeRef.current = Date.now();
                setTimeout(() =>
                {
                    altKeyDownStartTimeRef.current = 0;
                }, 1.5 * ALT_KEY_DOWN_TIMEOUT);
            }
            else if (Date.now() - altKeyDownStartTimeRef.current > ALT_KEY_DOWN_TIMEOUT)
            {
                altKeyDownStartTimeRef.current = 0;
                showKeybindInfo();
            }
        }
    }, [ showKeybindInfo ]);

    useMemo(() =>
    {
        if (typeof document === 'undefined') { return; }

        const keyUpListener = (event: KeyboardEvent) => keyUpHandler(event as unknown as React.KeyboardEvent<HTMLDivElement>);
        const keyDownListener = (event: KeyboardEvent) => keyDownHandler(event as unknown as React.KeyboardEvent<HTMLDivElement>);

        document.addEventListener('keyup', keyUpListener);
        document.addEventListener('keydown', keyDownListener);

        return () =>
        {
            document.removeEventListener('keyup', keyUpListener);
            document.removeEventListener('keydown', keyDownListener);
        };
    }, [ keyUpHandler, keyDownHandler ]);

    return (
        <KeybindsContext.Provider value={
            {
                isDefault: false,
                registerKeybind,
                keybindHintsState,
                showKeybindInfo,
            }
        }>
            { children }
        </KeybindsContext.Provider>
    );
};

export const useKeybinds = () =>
{
    const context = useContext(KeybindsContext);

    if (context.isDefault)
    {
        throw new Error('useKeybinds must be used within a KeybindsProvider');
    }

    return context;
};

export default useKeybinds;

export function getUserAgentAccessKey(): string
{
    if (typeof navigator === 'undefined' || !navigator || !navigator.userAgent) { return 'Alt'; }

    const userAgent = navigator.userAgent.toLowerCase();
    const isMac = /macintosh|mac os x/.test(userAgent);
    const isWindows = /windows|win32/.test(userAgent);
    const isLinux = /linux/.test(userAgent);
    const isChrome = /chrome/.test(userAgent);
    const isFirefox = /firefox/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !isChrome;
    const isIE = /msie|trident/.test(userAgent);
    const isEdge = /edge/.test(userAgent);

    if (isMac)
    {
        if (isChrome || isSafari) return 'Ctrl + Option';
        if (isFirefox) return 'Ctrl + Alt';
    }
    else if (isWindows || isLinux)
    {
        if (isChrome || isEdge) return 'Alt';
        if (isFirefox) return 'Alt + Shift';
        if (isIE) return 'Alt';
    }
    return 'Alt';
}
