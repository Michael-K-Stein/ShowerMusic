import { SearchToken, SuggestionGenerationResponse, TrackSearchToken, useSearch } from "@/app/components/search/search-provider";
import React, { useCallback } from "react";
import { Tooltip, Typography } from "@mui/material";
import { ShowerMusicObjectType } from "@/app/showermusic-object-types";
import { ArtistList } from "@/app/components/providers/global-props/global-modals";
import { useSessionState } from "@/app/components/providers/session/session";


export function SongSearchBarSuggestions({ clearTextSearch, suggestions, suggestionSelectedIndex }: { clearTextSearch: () => void; suggestions: SuggestionGenerationResponse | undefined; suggestionSelectedIndex: { suggestionIndexX: number; suggestionIndexY: number; }; })
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
            {/* <div className='search-bar-suggestions-container'>
                { trackNameCompletions }
            </div> */}
        </div>
    );
}

export function chooseMostRelevantSuggestion(existingSearchTokens: SearchToken[], suggestions: SuggestionGenerationResponse | undefined)
{
    // Take the first artist name, if there are no suggested artists, take the first album name.
    // If there are non of either, return undefined.
    let chosenToken = (suggestions && suggestions.artistNameTokens.at(0)) ?
        suggestions.artistNameTokens.at(0) :
        (
            (suggestions && suggestions.albumNameTokens.at(0)) ?
                suggestions.albumNameTokens.at(0) :
                undefined
        );

    // If there is a single match on an album, there is a higher chance that that's what the user wanted
    if (
        suggestions && (
            suggestions.albumNameTokens.length === 1 ||
            // Or if there is already at least one artist search token, we probably do not need another one
            (
                suggestions.albumNameTokens.length > 0 &&
                existingSearchTokens.filter((v: SearchToken) => v.itemType === ShowerMusicObjectType.Artist).length >= 1
            )
        )
    )
    {
        chosenToken = suggestions.albumNameTokens.at(0);
    }

    return chosenToken;
}

export function SongSearchBarInlineSuggestions({ clearTextSearch, suggestions }: { clearTextSearch: () => void; suggestions: SuggestionGenerationResponse | undefined; })
{
    const { mostReleventSuggestion } = useSearch();
    const onClickHandler = useCallback(() =>
    {
        clearTextSearch();
    }, [ clearTextSearch ]);

    const chosenToken = mostReleventSuggestion;

    const searchSuggestion = chosenToken ?
        <SongSearchBarInlineSuggestion
            onClickCallback={ onClickHandler }
            key={ `${chosenToken.itemType}-${chosenToken.itemId}` }
            token={ chosenToken } /> :
        undefined;

    return (
        <div className='search-bar-inline-suggestions-container'>
            { searchSuggestion }
        </div>
    );
}

export function SongSearchBarSuggestion({ token, onClickCallback, isSelected }: { token: SearchToken, onClickCallback: () => void, isSelected: boolean; })
{
    // const { setView } = useSessionState();
    const { appendSearchToken } = useSearch();

    const handleSuggestionClicked = useCallback((event: React.MouseEvent<HTMLElement>) =>
    {
        appendSearchToken(token);
        onClickCallback();
    }, [ token, appendSearchToken, onClickCallback ]);

    // const subContent = (token.itemType === ShowerMusicObjectType.Track) ? <ArtistList setView={setView}/> : <></>

    return (
        <div className='search-bar-suggestion' onClick={ handleSuggestionClicked } data-highlighted={ isSelected }>
            <Typography fontSize={ '1em' } fontWeight={ 700 }>{ token.displayName }</Typography>
            {/* {subContent} */ }
            <div className='suggestion-item-type'>
                <Typography fontSize={ '0.6em' }>{ token.itemType }</Typography>
            </div>
        </div>
    );
}

export function SongSearchBarInlineSuggestion({ token, onClickCallback }: { token: SearchToken | TrackSearchToken, onClickCallback: () => void; })
{
    const { setView } = useSessionState();
    const { appendSearchToken } = useSearch();
    const handleSuggestionClicked = useCallback((event: React.MouseEvent<HTMLElement>) =>
    {
        appendSearchToken(token);
        onClickCallback();
    }, [ token, appendSearchToken, onClickCallback ]);

    let subContent = undefined;

    if (token.itemType === ShowerMusicObjectType.Track)
    {
        subContent = <ArtistList artists={ (token as TrackSearchToken).artists } setView={ setView } />;
    }

    return (
        <Tooltip title={ 'TAB to accept' } placement="bottom">
            <div className='search-bar-inline-suggestion' onClick={ handleSuggestionClicked }>
                <Typography fontSize={ '1em' } fontWeight={ 700 }>{ token.displayName }</Typography>
                <div className='suggestion-item-type'>
                    <Typography fontSize={ '0.5em' }>{ token.itemType }</Typography>
                </div>
                { subContent }
            </div>
        </Tooltip>
    );
}
