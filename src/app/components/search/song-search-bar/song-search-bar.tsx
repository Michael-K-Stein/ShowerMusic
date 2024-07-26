'use client';
import './song-search-bar.css';
import '@/app/globals.css';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SuggestionGenerationResponse, useSearch } from '@/app/components/search/search-provider';
import { ClickAwayListener, Typography } from '@mui/material';
import assert from 'assert';
import { SongSearchBarBubbles } from '@/app/components/search/song-search-bar/song-search-bubble';
import { SongSearchBarInlineSuggestions, SongSearchBarSuggestions, chooseMostRelevantSuggestion } from './search-bar-suggestions';
import useKeybinds, { KeybindClickCallback } from '@/app/components/providers/global-props/keybinds-provider';
import KeybindHint from '@/app/components/other/keybind-hint';

function SearchGlyph()
{
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className='search-glyph'>
            <path fill="none" stroke="#FFFFFF" strokeWidth="3" d="M19 4A9 9 0 1 0 19 22 9 9 0 1 0 19 4zM4 28L13 19" />
        </svg>
    );
};

export default function SongSearchBar()
{
    const {
        performSearch,
        generateSearchSuggestions,
        removeTrailingSearchToken,
        appendSearchToken,
        setMostRelevantSuggestion,
        mostReleventSuggestion,
        searchTokens,
    } = useSearch();
    const { registerKeybind } = useKeybinds();
    const [ suggestedSearchTokens, setSuggestedSearchTokens ] = useState<SuggestionGenerationResponse>();

    const [ lastQueryString, setLastQueryString ] = useState<string>('');
    const [ textWidth, setTextWidth ] = useState<number>(0);
    const inputField = useRef<HTMLInputElement>(null);
    const spanElement = useRef<HTMLSpanElement>(null);

    let backSpaceConsecutiveCount = useRef<number>(0);

    const handleBackspace = useCallback(async () =>
    {
        removeTrailingSearchToken();
    }, [ removeTrailingSearchToken ]);

    const clearTextSearch = useCallback(() =>
    {
        if (!inputField.current) { return; }
        inputField.current.value = '';
        setSuggestedSearchTokens(undefined);
        inputField.current.focus();
    }, []);

    useMemo(() =>
    {
        setMostRelevantSuggestion(chooseMostRelevantSuggestion(searchTokens, suggestedSearchTokens));
    }, [ searchTokens, suggestedSearchTokens, setMostRelevantSuggestion ]);

    const keybindClickCallback: KeybindClickCallback = useCallback(async () =>
    {
        inputField.current?.focus();
    }, []);

    useMemo(() =>
    {
        const removeHandler = registerKeybind({ keybind: '?', callback: keybindClickCallback });
        return removeHandler;
    }, [ registerKeybind, keybindClickCallback ]);

    const attempToAppendSearchTokenOnTab = useCallback((_event: React.KeyboardEvent<HTMLInputElement>) =>
    {
        const searchTokenToAdd = mostReleventSuggestion;
        if (searchTokenToAdd === undefined) { return false; }
        appendSearchToken(searchTokenToAdd);
        clearTextSearch();
        setSuggestedSearchTokens(undefined);
        return true;
    }, [ mostReleventSuggestion, clearTextSearch, appendSearchToken, setSuggestedSearchTokens ]);

    const handleInputKeyDown = useCallback(async (event: React.KeyboardEvent<HTMLInputElement>) =>
    {
        if (event.key === 'Tab')
        {
            if (attempToAppendSearchTokenOnTab(event))
            {
                event.preventDefault();
                event.stopPropagation();
            }
            return;
        }
    }, [ attempToAppendSearchTokenOnTab ]);

    const handleSearchQueryChanged = useCallback(
        async (event: React.KeyboardEvent<HTMLInputElement>) =>
        {
            if (event.key === 'Escape')
            {
                setSuggestedSearchTokens(undefined);
                return;
            }

            const target = event.target as HTMLInputElement;
            if (!target.value)
            {
                setSuggestedSearchTokens(undefined);
                if (event.key === 'Backspace')
                {
                    backSpaceConsecutiveCount.current++;
                    if (backSpaceConsecutiveCount.current >= 2)
                    {
                        handleBackspace();
                    }
                }
                else
                {
                    backSpaceConsecutiveCount.current = 0;
                }
                return;
            }

            // Currently disabled since it doesn't really work that well
            // performSearch(target.value);

            setLastQueryString(target.value);
            const suggestions = await generateSearchSuggestions(target.value);
            setSuggestedSearchTokens(suggestions);
            backSpaceConsecutiveCount.current = 0;
        },
        [
            handleBackspace,
            generateSearchSuggestions,
            setSuggestedSearchTokens,
            setLastQueryString,
        ]
    );

    useEffect(() =>
    {
        setTextWidth(spanElement.current?.offsetWidth ?? 0);
    }, [ lastQueryString, setTextWidth ]);

    const handleClickAway = useCallback(() =>
    {
        setSuggestedSearchTokens(undefined);
    }, []);

    const searchBarNativeCompletionOptions = suggestedSearchTokens?.trackNameTokens
        .filter(
            (token) => token.displayName !== lastQueryString)
        .map(
            (token) =>
                <option key={ token.id.toString() } value={ token.displayName } />
        );

    return (
        <div className='w-full'>
            <div className='song-search-bar-shadow-blur'></div>
            <ClickAwayListener onClickAway={ handleClickAway }>
                <form action={ performSearch } className='song-search-bar' autoComplete='off'>
                    <SearchGlyph />
                    <div className='w-full song-search-bar-input'>
                        <div className='song-search-bar-bubble-container'>
                            <SongSearchBarBubbles />
                        </div>
                        <div className='w-full relative flex items-center' style={ { marginLeft: '0.8em' } }>
                            <div className='real-input-size-wrapper'>
                                <span className='real-input-size-span' ref={ spanElement }>{ lastQueryString }</span>
                                <input
                                    ref={ inputField }
                                    id='song-search-bar-text-input-field'
                                    type="text"
                                    name='query'
                                    className='real-input text-xlg font-bold'
                                    placeholder='song name...'
                                    onKeyUp={ handleSearchQueryChanged }
                                    onKeyDown={ handleInputKeyDown }
                                    autoComplete='off'
                                    spellCheck={ true }
                                    autoCorrect='on'
                                    list='search-bar-completions'
                                    accessKey='/'
                                    autoFocus={ true }
                                />
                                <datalist id="search-bar-completions">
                                    { searchBarNativeCompletionOptions }
                                </datalist>
                            </div>
                            <div className='absolute' style={ { marginLeft: `${textWidth}px` } }>
                                <SongSearchBarInlineSuggestions clearTextSearch={ clearTextSearch } suggestions={ suggestedSearchTokens } />
                            </div>
                            <KeybindHint className='flex flex-row items-center text-right justify-end me-4' fontSize={ 'inherit' } keybind={ '?' } importantHint={ true } />
                        </div>
                    </div>
                </form>
            </ClickAwayListener>
        </div>
    );
};
