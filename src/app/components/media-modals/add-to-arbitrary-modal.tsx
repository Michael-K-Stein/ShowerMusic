import { commandAnyAddArbitrary } from "@/app/client-api/common-utils";
import { removeFromFavoritesClickHandlerFactory, addToFavoritesClickHandlerFactory } from "@/app/client-api/favorites/favorites";
import { getUserMe, useAuth } from "@/app/components/auth-provider";
import AddSongGlyph from "@/app/components/glyphs/add-song";
import CreateGlyph from "@/app/components/glyphs/create";
import PlayPropertyGlyph from "@/app/components/glyphs/play-property";
import PlaylistGlyph from "@/app/components/glyphs/playlist";
import ItemFavoriteGlyph from "@/app/components/other/item-favorite-glyph";
import { PlaylistImage } from "@/app/components/pages/playlist-page/playlist-page";
import { addArbitraryToQueueClickHandler, setPlayNextArbitraryClickHandler } from "@/app/components/providers/global-props/arbitrary-click-handler-factories";
import { enqueueApiErrorSnackbar } from "@/app/components/providers/global-props/global-modals";
import { newPlaylistClickHandler } from "@/app/components/providers/global-props/global-props";
import { useSessionState } from "@/app/components/providers/session/session";
import useUserSession from "@/app/components/providers/user-provider/user-session";
import { MediaId } from "@/app/shared-api/media-objects/media-id";
import { ShowerMusicObjectType, ShowerMusicPlayableMediaDict } from "@/app/shared-api/other/common";
import { MinimalPlaylist } from "@/app/shared-api/other/playlist";
import { UserDict } from "@/app/shared-api/user-objects/users";
import { ShowerMusicPlayableMediaType } from "@/app/showermusic-object-types";
import { Divider, ListItemIcon, ListItemText, Menu, MenuItem, MenuItemProps, Paper, PopperProps } from "@mui/material";
import { useSnackbar } from "notistack";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface AddToArbitraryModalStateType
{
    posX: number;
    posY: number;
    event: React.MouseEvent<HTMLElement, MouseEvent>;
    mediaData: ShowerMusicPlayableMediaDict;
    mediaType: ShowerMusicPlayableMediaType;
};

type RecursiveMenuItemProps = MenuItemProps & { button?: true; } & Pick<PopperProps, "placement"> & { rootitem: React.ReactNode | React.JSX.Element; };

const RecursiveMenuItem = (props: RecursiveMenuItemProps) =>
{
    const [ open, setOpen ] = useState(false);
    const ref = useRef<HTMLLIElement | null>(null);

    return (
        <MenuItem
            { ...props }
            ref={ ref }
            onMouseEnter={ () => setOpen(true) }
            onMouseLeave={ () => setOpen(false) }
        >
            { props.rootitem }
            <Menu open={ open }
                anchorEl={ ref.current }
                anchorOrigin={ {
                    vertical: 'top',
                    horizontal: 'right',
                } }
                transformOrigin={ {
                    vertical: 'top',
                    horizontal: 'left',
                } }
                onClose={ () => setOpen(false) }
            >
                { props.children }
            </Menu>
        </MenuItem>
    );
};

export default function AddToArbitraryModal()
{
    const { enqueueSnackbar } = useSnackbar();
    const { userPlaylists, isItemInUsersFavorites } = useUserSession();
    const { addToArbitraryModalState, setAddToArbitraryModalState, addToArbitraryModalOpenState } = useSessionState();

    const [ itemInUserFavorites, setItemInUserFavorites ] = useState<boolean>(false);

    useMemo(() =>
    {
        if (!addToArbitraryModalState?.mediaData) { return; }
        setItemInUserFavorites(isItemInUsersFavorites(addToArbitraryModalState?.mediaData.id, addToArbitraryModalState.mediaType));
    }, [ addToArbitraryModalState?.mediaData, addToArbitraryModalState?.mediaType, isItemInUsersFavorites, setItemInUserFavorites ]);

    const favoritesButtonClickHandlerFactory = useCallback(() =>
    {
        if (!addToArbitraryModalState?.mediaData) { return () => { }; }
        if (itemInUserFavorites)
        {
            return removeFromFavoritesClickHandlerFactory(addToArbitraryModalState?.mediaData, addToArbitraryModalState.mediaType, enqueueSnackbar);
        }
        else
        {
            return addToFavoritesClickHandlerFactory(addToArbitraryModalState?.mediaData, addToArbitraryModalState.mediaType, enqueueSnackbar);
        }
    }, [ addToArbitraryModalState?.mediaData, addToArbitraryModalState?.mediaType, itemInUserFavorites, enqueueSnackbar ]);


    const addToQueueClickHandlerFactory = useCallback(() =>
    {
        if (addToArbitraryModalState === undefined) { return () => { }; }
        return addArbitraryToQueueClickHandler(addToArbitraryModalState.mediaData, addToArbitraryModalState.mediaType, enqueueSnackbar);
    }, [ addToArbitraryModalState, enqueueSnackbar ]);

    const setPlayNextTrackClickHandlerFactory = useCallback(() =>
    {
        if (addToArbitraryModalState === undefined) { return () => { }; }
        return setPlayNextArbitraryClickHandler(addToArbitraryModalState.mediaData, addToArbitraryModalState.mediaType, enqueueSnackbar);
    }, [ addToArbitraryModalState, enqueueSnackbar ]);

    const newPlaylistClickHandlerFactory = useCallback(() =>
    {
        if (addToArbitraryModalState === undefined) { return () => { }; }
        return newPlaylistClickHandler({
            items: [
                {
                    mediaType: addToArbitraryModalState.mediaType,
                    mediaId: addToArbitraryModalState.mediaData.id,
                    mediaName: addToArbitraryModalState.mediaData.name,
                },
            ],
            name: `${addToArbitraryModalState.mediaData.name} Playlist`,
        }, enqueueSnackbar);
    }, [ addToArbitraryModalState, enqueueSnackbar ]);

    if (addToArbitraryModalState === undefined)
    {
        return (
            <Menu open={ false } >
            </Menu>
        );
    }

    const playlistMenuItems = userPlaylists ? (
        userPlaylists.map((playlist) =>
        {
            return (
                <MenuItem key={ playlist.id } onClick={
                    () =>
                    {
                        commandAnyAddArbitrary(
                            addToArbitraryModalState.mediaType, addToArbitraryModalState.mediaData.id,
                            ShowerMusicObjectType.Playlist, playlist.id
                        ).then((v) =>
                        {
                            if (enqueueSnackbar)
                            {
                                enqueueSnackbar(`"${addToArbitraryModalState.mediaData.name}" has been added to ${playlist.name}`, { variant: 'success' });
                            }
                        }
                        ).catch(
                            (e) =>
                            {
                                enqueueApiErrorSnackbar(
                                    enqueueSnackbar,
                                    `Failed to add ${addToArbitraryModalState.mediaData.name} to playlist ${playlist.name} !`,
                                    e
                                );
                            }
                        );
                    }
                }>
                    <ListItemIcon className="w-6 pr-1">
                        <PlaylistImage playlistInitData={ playlist } />
                    </ListItemIcon>
                    <ListItemText>{ playlist.name }</ListItemText>
                </MenuItem>
            );
        }
        )
    ) : [];

    return (
        <Paper>
            <Menu
                open={ addToArbitraryModalOpenState }
                onClose={ () => { setAddToArbitraryModalState(undefined); } }
                anchorEl={ addToArbitraryModalState.event.target as Element } // Ignore this warning
            >
                <MenuItem onClick={ setPlayNextTrackClickHandlerFactory() }>
                    <ListItemIcon>
                        <div className="w-6">
                            <PlayPropertyGlyph glyphTitle="" />
                        </div>
                    </ListItemIcon>
                    <ListItemText>Play next</ListItemText>
                </MenuItem>
                <MenuItem onClick={ addToQueueClickHandlerFactory() }>
                    <ListItemIcon>
                        <div className="w-6">
                            <AddSongGlyph glyphTitle="" />
                        </div>
                    </ListItemIcon>
                    <ListItemText>Add to queue</ListItemText>
                </MenuItem>
                <MenuItem onClick={ favoritesButtonClickHandlerFactory() }>
                    <ListItemIcon>
                        <ItemFavoriteGlyph
                            glyphTitle=""
                            item={ addToArbitraryModalState.mediaData }
                            itemType={ addToArbitraryModalState.mediaType }
                            className="w-6 flex items-center flex-col justify-center content-center"
                        />
                    </ListItemIcon>
                    <ListItemText>{ itemInUserFavorites ? "Unfavorite" : "Favorite" }</ListItemText>
                </MenuItem>
                <Divider />
                <RecursiveMenuItem
                    rootitem={
                        <>
                            <ListItemIcon>
                                <div className="w-6">
                                    <PlaylistGlyph glyphTitle="" />
                                </div>
                            </ListItemIcon>
                            <ListItemText>Add to playlist</ListItemText>
                        </>
                    }
                >
                    <MenuItem onClick={ newPlaylistClickHandlerFactory() }>
                        <ListItemIcon>
                            <div className="w-6">
                                <CreateGlyph glyphTitle="" />
                            </div>
                        </ListItemIcon>
                        <ListItemText>New playlist</ListItemText>
                    </MenuItem>
                    { playlistMenuItems }
                </RecursiveMenuItem>
            </Menu >
        </Paper >
    );
}