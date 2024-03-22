import { SearchToken, TrackSearchToken, useSearch } from "@/app/components/search/search-provider";
import { Tooltip, Typography } from "@mui/material";
import { useCallback } from "react";

export function SongSearchBarBubble({ searchToken }: { searchToken: SearchToken; })
{
    const { removeSearchToken } = useSearch();
    const handleSuggestionClicked = useCallback((event: React.MouseEvent<HTMLElement>) =>
    {
        removeSearchToken(searchToken);
    }, [ searchToken, removeSearchToken ]);

    return (
        <Tooltip title={ <>Filter by { searchToken.itemType } <b>{ searchToken.displayName }</b></> } placement="bottom">
            <div className='song-search-bar-bubble' onClick={ handleSuggestionClicked }>
                <Typography fontSize={ '0.6em' } fontWeight={ 700 }>{ searchToken.displayName }</Typography>
            </div>
        </Tooltip>
    );
}

export function SongSearchBarBubbles()
{
    const { searchTokens } = useSearch();
    const searchTokenBubbles = searchTokens.map((token, index) => <SongSearchBarBubble key={ `token-${index}- ${token.itemId} -${token.id}` } searchToken={ token } />);
    return (
        <div className='song-search-bar-bubbles'>
            { searchTokenBubbles }
        </div>
    );
}
