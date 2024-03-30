import { addAnyToArbitraryClickHandlerFactory } from "@/app/client-api/common-utils";
import AddGlyph from "@/app/components/glyphs/add";
import AddSongGlyph from "@/app/components/glyphs/add-song";
import PlayGlyph from "@/app/components/glyphs/play";
import ItemFavoriteGlyph from "@/app/components/other/item-favorite-glyph";
import { ArbitraryPlayableMediaImage, resolveArbitraryPlayableMedia } from "@/app/components/pages/home-page/user-recently-played";
import { addArbitraryToQueueClickHandler, playArbitraryClickHandlerFactory } from "@/app/components/providers/global-props/arbitrary-click-handler-factories";
import { ArtistList } from '@/app/components/providers/global-props/global-modals';
import { SetView, useSessionState } from "@/app/components/providers/session/session";
import { TrackDict } from "@/app/shared-api/media-objects/tracks";
import { ShowerMusicPlayableMediaDict } from "@/app/shared-api/other/common";
import { ShowerMusicNamedResolveableItem, ShowerMusicResolveableItem } from "@/app/shared-api/user-objects/users";
import { ShowerMusicObjectType, ShowerMusicPlayableMediaType } from "@/app/showermusic-object-types";
import { Box, Tooltip, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import { HtmlHTMLAttributes, KeyboardEvent, MouseEventHandler, useCallback, useMemo, useState } from "react";
import { gotoAlbumCallbackFactory, gotoArtistCallbackFactory, gotoPlaylistCallbackFactory, gotoStationCallbackFactory } from '../../pages/goto-callback-factory';
import './card-modal.css';
import '@/app/globals.css';
import '@/app/fonts.css';
import KeyboardNavigation from "@/app/components/keyboard-navigation";

interface CardModalInternalPassthroughProps
{
    withTypeName?: boolean;
    textContent?: React.JSX.Element | React.ReactNode;
    extraControls?: React.JSX.Element | React.ReactNode;
    cardModalHtmlAttributes?: HtmlHTMLAttributes<HTMLDivElement> & { 'data-static-card': boolean; };
}
interface CardModalInternalProps extends CardModalInternalPassthroughProps
{
    itemResolveHint?: ShowerMusicResolveableItem;
    item?: ShowerMusicPlayableMediaDict;
};

interface CardModalSharedProps extends CardModalInternalPassthroughProps
{
    containsFullData: boolean;

}
interface CardModalWithFullDataProps extends CardModalSharedProps
{
    containsFullData: true;
    item: ShowerMusicPlayableMediaDict;
};
interface CardModalWithoutFullDataProps extends CardModalSharedProps
{
    containsFullData: false;
    item: ShowerMusicResolveableItem;
};
export type CardModalProps = CardModalWithFullDataProps | CardModalWithoutFullDataProps;


export function gotoArbitraryPlayableMediaPageCallbackFactory(
    itemResolveHint: ShowerMusicResolveableItem,
    itemData: ShowerMusicPlayableMediaDict | undefined,
    setView: SetView
): MouseEventHandler
{
    switch (itemResolveHint.type)
    {
        case ShowerMusicObjectType.Track:
            return itemData ? gotoAlbumCallbackFactory(setView, (itemData as TrackDict).album.id) : () => { };
        case ShowerMusicObjectType.Album:
            return gotoAlbumCallbackFactory(setView, itemResolveHint.id);
        case ShowerMusicObjectType.Artist:
            return gotoArtistCallbackFactory(setView, itemResolveHint.id);
        case ShowerMusicObjectType.Playlist:
            return gotoPlaylistCallbackFactory(setView, itemResolveHint.id);
        case ShowerMusicObjectType.Station:
            return gotoStationCallbackFactory(setView, itemResolveHint.id);
        default:
            break;
    }
    return (_event: React.MouseEvent<HTMLElement>) => { };
}

export function CardModalControls(
    {
        item,
        itemType,
        keyboardNavigationEnabled,
        ...props
    }: {
        item?: ShowerMusicPlayableMediaDict | ShowerMusicNamedResolveableItem | ShowerMusicResolveableItem,
        itemType?: ShowerMusicPlayableMediaType,
        keyboardNavigationEnabled: boolean;
    } & CardModalInternalPassthroughProps
)
{
    const { enqueueSnackbar } = useSnackbar();
    const { setAddToArbitraryModalState, setStream } = useSessionState();

    if (!item || !itemType) { return; }

    if (!('name' in item)) { (item as ShowerMusicNamedResolveableItem).name = ''; }

    return (
        <div
            className='card-modal-controls-parent absolute top-2 right-2 flex flex-col'
            onClick={
                (event) =>
                {
                    event.stopPropagation();
                }
            }
            tabIndex={ -1 }
        >
            <div className='card-modal-controls'>
                <PlayGlyph
                    className='card-modal-add-glyph'
                    glyphTitle='Play'
                    placement='right'
                    onClick={ playArbitraryClickHandlerFactory(item as (ShowerMusicPlayableMediaDict | ShowerMusicNamedResolveableItem), itemType, setStream, enqueueSnackbar) }
                    tabIndex={ keyboardNavigationEnabled ? 0 : -1 }
                />

                <AddSongGlyph
                    className='card-modal-add-glyph'
                    glyphTitle='Add to queue'
                    placement='right'
                    onClick={ addArbitraryToQueueClickHandler(item as (ShowerMusicPlayableMediaDict | ShowerMusicNamedResolveableItem), itemType, enqueueSnackbar) }
                    tabIndex={ keyboardNavigationEnabled ? 0 : -1 }
                />

                <AddGlyph
                    className='card-modal-add-glyph'
                    glyphTitle='Add to'
                    placement='right'
                    onClick={ addAnyToArbitraryClickHandlerFactory(item as (ShowerMusicPlayableMediaDict | ShowerMusicNamedResolveableItem), itemType, setAddToArbitraryModalState) }
                    tabIndex={ keyboardNavigationEnabled ? 0 : -1 }
                />

                <ItemFavoriteGlyph
                    item={ item as (ShowerMusicPlayableMediaDict | ShowerMusicNamedResolveableItem) }
                    itemType={ itemType }
                    className='card-modal-add-glyph'
                    placement='right'
                    tabIndex={ keyboardNavigationEnabled ? 0 : -1 }
                />

                { props.extraControls }
            </div>
        </div >
    );
}

function CardModalInternal(
    {
        itemResolveHint,
        item,
        ...props
    }: CardModalInternalProps
)
{
    const { setView } = useSessionState();
    const [ itemName, setItemName ] = useState<string>('');
    const [ keyboardNavigationEnabled, setKeyboardNavigationEnabled ] = useState<boolean>(false);

    useMemo(() =>
    {
        if (!itemResolveHint) { return; }
        if (item !== undefined && item.name)
        {
            setItemName(item.name);
        }
        else if (itemResolveHint.includesName === true)
        {
            setItemName((itemResolveHint as ShowerMusicNamedResolveableItem).name);
        }
    }, [ itemResolveHint, item, setItemName ]);

    const onClickCallbackFacotry = useCallback(() =>
    {
        if (!itemResolveHint) { return () => { }; }
        return gotoArbitraryPlayableMediaPageCallbackFactory(itemResolveHint, item, setView);
    }, [ itemResolveHint, item, setView ]);

    const keyDownHandler = useCallback((event: KeyboardEvent<HTMLDivElement>) =>
    {
        if (!KeyboardNavigation.isClick(event)) { return; }
        setKeyboardNavigationEnabled(v => !v);
        event.stopPropagation();
        event.preventDefault();
    }, [ setKeyboardNavigationEnabled ]);

    return (
        <div
            className='card-modal'
            onClick={ onClickCallbackFacotry() }
            onKeyDown={ keyDownHandler }
            { ...props.cardModalHtmlAttributes }
            tabIndex={ 0 }
            data-keyboard-navigation-enabled={ keyboardNavigationEnabled }
        >
            <div className='card-modal-cover-art'>
                <ArbitraryPlayableMediaImage data={ item } />
            </div>
            <div className='card-modal-text-content'>
                {
                    props.textContent ??
                    <Typography variant="h5" fontSize={ '1.4em' }>{ itemName }</Typography>
                }
            </div>
            {
                props?.withTypeName &&
                <div className='card-modal-item-type'>
                    <Typography fontSize={ '1.0em' }>{ itemResolveHint?.type }</Typography>
                </div>
            }
            <CardModalControls
                item={ item ?? itemResolveHint }
                itemType={ itemResolveHint?.type }
                keyboardNavigationEnabled={ keyboardNavigationEnabled }
                { ...props } />
        </div>
    );
}


export default function CardModal(
    {
        containsFullData,
        item,
        ...props
    }: CardModalProps
)
{
    const { enqueueSnackbar } = useSnackbar();
    const { setView } = useSessionState();
    const [ itemData, setItemData ] = useState<ShowerMusicPlayableMediaDict>();

    useMemo(() =>
    {
        if (containsFullData)
        {
            setItemData(item);
            return;
        }

        resolveArbitraryPlayableMedia(item.type, item.id, setItemData, enqueueSnackbar);
    }, [ item, containsFullData, enqueueSnackbar ]);

    const cardModalTextContent = (
        <Tooltip
            title={
                <div className='flex flex-col items-center justify-center text-ellipsis text-center'>
                    <Typography fontWeight={ 700 }>{ ('name' in item) ? item.name : (itemData?.name) }</Typography>
                    <ArtistList setView={ setView } artists={ (itemData && 'artists' in itemData) ? itemData.artists : [] } className='flex flex-wrap' />
                </div>
            }
            placement='top'>
            <Box>
                <Typography fontSize={ '1em' } fontWeight={ 700 }>{ ('name' in item) ? item.name : (itemData?.name) }</Typography>
                <Typography fontSize={ '0.7em' } fontWeight={ 500 }>{ (itemData && 'artists' in itemData) ? itemData.artists[ 0 ].name : '' }</Typography>
            </Box>
        </Tooltip>
    );


    return (
        <CardModalInternal item={ itemData } itemResolveHint={ item as ShowerMusicResolveableItem } textContent={ cardModalTextContent }  { ...props } />
    );
}

export function CardModalSkeletonLoader()
{
    return (
        <CardModalInternal item={ undefined } itemResolveHint={ undefined } />
    );
}
