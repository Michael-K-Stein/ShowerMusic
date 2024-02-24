import { removeFromFavoritesClickHandlerFactory, addToFavoritesClickHandlerFactory } from "@/app/client-api/favorites/favorites";
import LoveCircledGlyph from "@/app/components/glyphs/love-circled";
import useUserSession from "@/app/components/providers/user-provider/user-session";
import { ShowerMusicPlayableMediaDict } from "@/app/shared-api/other/common";
import { ShowerMusicPlayableMediaType } from "@/app/showermusic-object-types";
import { TooltipProps } from "@mui/material";
import { useSnackbar } from "notistack";
import React, { useCallback, useMemo, useState } from "react";

export default function ItemFavoriteGlyph(
    { item, itemType, glyphTitle, placement, ...props }:
        {
            item?: ShowerMusicPlayableMediaDict,
            itemType: ShowerMusicPlayableMediaType,
            glyphTitle?: string,
            placement?: TooltipProps[ 'placement' ];
        } &
        React.HTMLAttributes<HTMLDivElement>)
{
    const { enqueueSnackbar } = useSnackbar();
    const { isItemInUsersFavorites } = useUserSession();

    const [ itemInUserFavorites, setItemInUserFavorites ] = useState<boolean>(false);

    useMemo(() =>
    {
        if (!item) { return; }
        setItemInUserFavorites(isItemInUsersFavorites(item.id, itemType));
    }, [ item, itemType, isItemInUsersFavorites, setItemInUserFavorites ]);

    const favoritesButtonClickHandlerFactory = useCallback(() =>
    {
        if (!item) { return () => { }; }
        if (itemInUserFavorites)
        {
            return removeFromFavoritesClickHandlerFactory(item, itemType, enqueueSnackbar);
        }
        else
        {
            return addToFavoritesClickHandlerFactory(item, itemType, enqueueSnackbar);
        }
    }, [ item, itemType, itemInUserFavorites, enqueueSnackbar ]);

    return (
        <div
            { ...props }
            onClick={ favoritesButtonClickHandlerFactory() }
            style={ { color: itemInUserFavorites ? 'cyan' : 'inherit' } }
        >
            <LoveCircledGlyph glyphTitle={ glyphTitle !== undefined ? glyphTitle : (itemInUserFavorites ? "Unfavorite" : "Favorite") } placement={ placement } />
        </div>
    );
}
