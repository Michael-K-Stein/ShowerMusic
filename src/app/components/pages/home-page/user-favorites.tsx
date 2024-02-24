import PlayGlyph from '@/app/components/glyphs/play';
import './home-page-favorites.css';
import { addAnyToArbitraryClickHandlerFactory, getClientSideObjectId } from "@/app/client-api/common-utils";
import { resolveArbitraryPlayableMedia, gotoArbitraryPlayableMediaPageCallbackFactory, ArbitraryPlayableMediaImage } from "@/app/components/pages/home-page/user-recently-played";
import { useSessionState } from "@/app/components/providers/session/session";
import useUserSession from "@/app/components/providers/user-provider/user-session";
import { ShowerMusicPlayableMediaDict } from "@/app/shared-api/other/common";
import { FavoritesItem } from "@/app/shared-api/user-objects/users";
import { ShowerMusicPlayableMediaType } from '@/app/showermusic-object-types';
import { Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import { useState, useMemo, useCallback } from "react";
import AddSongGlyph from '@/app/components/glyphs/add-song';
import { playArbitraryClickHandlerFactory, addArbitraryToQueueClickHandler } from '@/app/components/providers/global-props/arbitrary-click-handler-factories';
import AddGlyph from '@/app/components/glyphs/add';
import ItemFavoriteGlyph from '@/app/components/other/item-favorite-glyph';

export function UserFavoriteModalControls({ item, itemType }: { item?: ShowerMusicPlayableMediaDict, itemType: ShowerMusicPlayableMediaType; })
{
    const { enqueueSnackbar } = useSnackbar();
    const { setAddToArbitraryModalState, setStream } = useSessionState();

    if (!item) { return; }

    return (
        <div className='card-modal-controls-parent absolute w-6 h-6 top-2 right-2 flex flex-col' onClick={ (event) => { event.stopPropagation(); } }>
            <div className='card-modal-controls'>
                <PlayGlyph
                    className='card-modal-add-glyph'
                    glyphTitle='Play'
                    placement='right'
                    onClick={ playArbitraryClickHandlerFactory(item, itemType, setStream, enqueueSnackbar) }
                />

                <AddSongGlyph
                    className='card-modal-add-glyph'
                    glyphTitle='Add to queue'
                    placement='right'
                    onClick={ addArbitraryToQueueClickHandler(item, itemType, enqueueSnackbar) }
                />

                <AddGlyph
                    className='card-modal-add-glyph'
                    glyphTitle='Add to'
                    placement='right'
                    onClick={ addAnyToArbitraryClickHandlerFactory(item, itemType, setAddToArbitraryModalState) }
                />

                <ItemFavoriteGlyph
                    item={ item }
                    itemType={ itemType }
                    className='card-modal-add-glyph'
                    placement='right'
                />
            </div>
        </div >
    );
}

function UserFavoritesItem({ item }: { item: FavoritesItem; })
{
    const { enqueueSnackbar } = useSnackbar();
    const { setView } = useSessionState();
    const [ itemData, setItemData ] = useState<ShowerMusicPlayableMediaDict>();
    useMemo(() =>
    {
        resolveArbitraryPlayableMedia(item.mediaType, item.mediaId, setItemData, enqueueSnackbar);
    }, [ item, enqueueSnackbar ]);

    const onClickCallbackFacotry = useCallback(() =>
    {
        return gotoArbitraryPlayableMediaPageCallbackFactory(item, itemData, setView);
    }, [ item, itemData, setView ]);

    return (
        <div className='card-modal' id={ getClientSideObjectId(item) } onClick={ onClickCallbackFacotry() }>
            <div className='card-modal-cover-art'>
                <ArbitraryPlayableMediaImage data={ itemData } />
            </div>
            <div className="w-full flex item-center justify-center text-center">
                <Typography variant="h5">{ item.mediaName }</Typography>
            </div>
            <div className='favorites-item-type'>
                <Typography fontSize={ '0.8em' }>{ item.mediaType }</Typography>
            </div>
            <UserFavoriteModalControls item={ itemData } itemType={ item.mediaType } />
        </div>
    );
}

function UserFavoritesInternal()
{
    const { userFavorites } = useUserSession();

    if (userFavorites === undefined || userFavorites.items.length === 0)
    {
        return (
            <div>

            </div>
        );
    }

    const items = userFavorites.items.map(
        (item) =>
            <UserFavoritesItem key={ getClientSideObjectId(item) } item={ item } />
    );

    return (
        <div>
            <Typography variant='h4'>Your favorites</Typography>
            <div className='flex flex-row items-center flex-wrap'>
                { items }
            </div>
        </div>
    );
}

export default function UserFavorites()
{
    return (
        <div className="user-favorites-container-wrapper">
            <UserFavoritesInternal />
        </div>
    );
}