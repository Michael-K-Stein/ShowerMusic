'use client';
import './song-search-bar.css';
import React, { useCallback, useRef, useState } from 'react';
import { SearchToken, SuggestionGenerationResponse, useSearch } from '@/app/components/search/search-provider';
import { ClickAwayListener, Typography } from '@mui/material';
import assert from 'assert';

function SearchGlyph()
{
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className='search-glyph'>
            <path fill="none" stroke="#FFFFFF" strokeWidth="3" d="M19 4A9 9 0 1 0 19 22 9 9 0 1 0 19 4zM4 28L13 19" />
        </svg>
    );
};

function SongSearchBarBubble({ searchToken }: { searchToken: SearchToken; })
{
    const { removeSearchToken } = useSearch();
    const handleSuggestionClicked = useCallback((event: React.MouseEvent<HTMLElement>) =>
    {
        removeSearchToken(searchToken);
    }, [ searchToken, removeSearchToken ]);

    return (
        <div className='song-search-bar-bubble' onClick={ handleSuggestionClicked }>
            <Typography fontSize={ '0.6em' } fontWeight={ 700 }>{ searchToken.displayName }</Typography>
        </div>
    );
}

function SongSearchBarBubbles()
{
    const { searchTokens } = useSearch();
    const searchTokenBubbles = searchTokens.map((token, index) => <SongSearchBarBubble key={ `token-${index}-${token.itemId}-${token.id}` } searchToken={ token } />);
    return (
        <div className='song-search-bar-bubbles'>
            { searchTokenBubbles }
        </div>
    );
}

function SongSearchBarSuggestion({ token, onClickCallback, isSelected }: { token: SearchToken, onClickCallback: () => void, isSelected: boolean; })
{
    const { appendSearchToken } = useSearch();

    const handleSuggestionClicked = useCallback((event: React.MouseEvent<HTMLElement>) =>
    {
        appendSearchToken(token);
        onClickCallback();
    }, [ token, appendSearchToken, onClickCallback ]);

    return (
        <div className='search-bar-suggestion' onClick={ handleSuggestionClicked } data-highlighted={ isSelected }>
            <Typography fontSize={ '1em' } fontWeight={ 700 }>{ token.displayName }</Typography>
            <div className='suggestion-item-type'>
                <Typography fontSize={ '0.6em' }>{ token.itemType }</Typography>
            </div>
        </div>
    );
}

function SongSearchBarSuggestions({ clearTextSearch, suggestions, suggestionSelectedIndex }: { clearTextSearch: () => void, suggestions: SuggestionGenerationResponse | undefined, suggestionSelectedIndex: { suggestionIndexX: number, suggestionIndexY: number; }; })
{
    const onClickHandler = useCallback(() =>
    {
        clearTextSearch();
    }, [ clearTextSearch ]);

    const trackNameCompletions = suggestions ?
        suggestions.trackNameTokens.map(
            (token: SearchToken, index: number) => <SongSearchBarSuggestion
                isSelected={ suggestionSelectedIndex.suggestionIndexX === 1 && suggestionSelectedIndex.suggestionIndexY === index }
                onClickCallback={ onClickHandler }
                key={ `${token.itemType}-${token.itemId}` }
                token={ token } />) : [];

    const artistNameSuggestions = suggestions ?
        suggestions.artistNameTokens.map(
            (token: SearchToken, index: number) => <SongSearchBarSuggestion
                isSelected={ suggestionSelectedIndex.suggestionIndexX === 0 && suggestionSelectedIndex.suggestionIndexY === index }
                onClickCallback={ onClickHandler }
                key={ `${token.itemType}-${token.itemId}` }
                token={ token } />) : [];
    return (
        <div className='flex flex-row'>
            <div className='search-bar-suggestions-container'>
                { artistNameSuggestions }
            </div>
            <div className='search-bar-suggestions-container'>
                { trackNameCompletions }
            </div>
        </div>
    );
}
export default function SongSearchBar()
{
    const { performSearch, generateSearchSuggestions, removeTrailingSearchToken, appendSearchToken } = useSearch();
    const [ autoCorrections, setAutoCorrections ] = useState<SuggestionGenerationResponse>();

    const [ suggestionIndexX, setSuggestionIndexX ] = useState<number>(0);
    const [ suggestionIndexY, setSuggestionIndexY ] = useState<number>(0);

    let backSpaceConsecutiveCount = useRef<number>(0);

    const handleBackspace = useCallback(async () =>
    {
        removeTrailingSearchToken();
    }, [ removeTrailingSearchToken ]);

    const clearTextSearch = useCallback(() =>
    {
        const searchField = document.getElementById('song-search-bar-text-input-field');
        if (!searchField) { return; }
        (searchField as HTMLInputElement).value = '';
    }, []);

    const handleArrowEvent = useCallback(async (event: React.KeyboardEvent<HTMLInputElement>) =>
    {
        assert(event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowRight');

        const inSuggestionsRangeX = (v: number) =>
        {
            if (!autoCorrections) { return 0; }
            if (autoCorrections.artistNameTokens.length === 0) { return 1; }
            if (autoCorrections.trackNameTokens.length === 0) { return 0; }
            return (v + 2) % 2;
        };

        const inSuggestionsRangeY = (v: number) =>
        {
            if (!autoCorrections) { return 0; }
            const arr = suggestionIndexX === 0 ? autoCorrections.artistNameTokens : autoCorrections.trackNameTokens;
            if (arr.length === 0) { return 0; }
            return (v + arr.length) % arr.length;
        };

        switch (event.key)
        {
            case 'ArrowUp':
                setSuggestionIndexY(value => inSuggestionsRangeY(value - 1));
                break;
            case 'ArrowDown':
                setSuggestionIndexY(value => inSuggestionsRangeY(value + 1));
                break;
            case 'ArrowLeft':
                setSuggestionIndexX(value => inSuggestionsRangeX(value - 1));
                break;
            case 'ArrowRight':
                setSuggestionIndexX(value => inSuggestionsRangeX(value + 1));
                break;
        }
    }, [ autoCorrections, setSuggestionIndexX, setSuggestionIndexY, suggestionIndexX ]);

    const attemptToAppendSearchTokenOnEnter = useCallback(async (event: React.KeyboardEvent<HTMLInputElement>) =>
    {
        // No suggestions to handle
        if (!autoCorrections) { return; }

        const arr = suggestionIndexX === 0 ? autoCorrections.artistNameTokens : autoCorrections.trackNameTokens;
        if (suggestionIndexY >= arr.length || suggestionIndexY < 0) { return; }

        appendSearchToken(arr[ suggestionIndexY ]);
        clearTextSearch();
        setAutoCorrections(undefined);
    }, [ autoCorrections, suggestionIndexX, suggestionIndexY, appendSearchToken, clearTextSearch, setAutoCorrections ]);

    const handleSearchQueryChanged = useCallback(async (event: React.KeyboardEvent<HTMLInputElement>) =>
    {
        if (event.key === 'Escape')
        {
            setAutoCorrections(undefined);
            return;
        }
        else if (event.key.substring(0, 5) === 'Arrow')
        {
            return handleArrowEvent(event);
        }
        else if (event.key === 'Enter')
        {
            return attemptToAppendSearchTokenOnEnter(event);
        }

        const target = event.target as HTMLInputElement;
        if (!target.value)
        {
            setAutoCorrections({ trackNameTokens: [], artistNameTokens: [] });
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
        const suggestions = await generateSearchSuggestions(target.value);
        console.log(`Suggestions: `, suggestions);
        setAutoCorrections(suggestions);
        backSpaceConsecutiveCount.current = 0;
    }, [ handleBackspace, generateSearchSuggestions, setAutoCorrections, handleArrowEvent, attemptToAppendSearchTokenOnEnter ]);

    const handleClickAway = useCallback(() =>
    {
        setAutoCorrections(undefined);
    }, []);

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
                        <div className='w-full relative flex items-center'>
                            <input
                                id='song-search-bar-text-input-field'
                                type="text"
                                name='query'
                                className='real-input min-w-full max-w-full w-full text-xlg font-bold'
                                placeholder='song name...'
                                onKeyUp={ handleSearchQueryChanged }
                            />
                            <div className='song-search-input-suggestions-container'>
                                <SongSearchBarSuggestions suggestionSelectedIndex={ { suggestionIndexX, suggestionIndexY } } clearTextSearch={ clearTextSearch } suggestions={ autoCorrections } />
                            </div>
                        </div>
                    </div>
                </form>
            </ClickAwayListener>
        </div>
    );
};
