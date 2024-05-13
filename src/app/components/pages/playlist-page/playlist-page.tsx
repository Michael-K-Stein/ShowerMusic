'use client';
import './playlist-page.css';
import React, { FormEvent, useCallback, useMemo, useRef, useState } from 'react';
import { useSnackbar } from 'notistack';
import { ModalNameRectangleLoaderSkeleton, enqueueApiErrorSnackbar } from '@/app/components/providers/global-props/global-modals';
import Playlist, { PlaylistAndStationBaseInterface, PlaylistId } from '@/app/shared-api/other/playlist';
import { commandRenamePlaylist, getPlaylist } from '@/app/client-api/get-playlist';
import { ShowerMusicObjectType } from '@/app/shared-api/other/common';
import SharedSyncObjectProvider, { useSharedSyncObject } from '@/app/components/providers/shared-sync-object-provides';
import RenameGlyph from '@/app/components/glyphs/rename';
import { Box, Button, capitalize, FormControl, FormGroup, TextField, Typography } from '@mui/material';
import useGlobalProps from '@/app/components/providers/global-props/global-props';
import SendIcon from '@mui/icons-material/Send';
import commandGetUserById from '@/app/client-api/users/get-user';
import { ModalPageLoader } from '@/app/components/pages/modal-page/modal-page';
import { commandUserStationAccess } from '@/app/client-api/stations/get-station-specific';
import RadioTowerGlyph from '@/app/components/glyphs/radio-tower';
import { convertPlaylistToStationClickHandlerFactory } from '@/app/components/pages/playlist-page/playlist-callback-factories';
import { UserId, useUserPreferedName } from '@/app/shared-api/user-objects/users';
import { MessageTypes } from '@/app/settings';

function PlaylistMembers({ playlist }: { playlist?: Playlist; })
{
    const listenerCount = (playlist?.members.length ?? 0) + 1;
    return (
        <div>
            <Typography >{ listenerCount } listener{ listenerCount === 1 ? '' : 's' }</Typography>
        </div>
    );
}

function PlaylistSpecificSubInfo({ playlist }: { playlist: Playlist; })
{
    const { enqueueSnackbar } = useSnackbar();

    return (
        <div className='absolute w-full h-full flex flex-row items-end justify-end content-center right-0 bottom-0'>
            <div className='m-2'>
                <PlaylistMembers playlist={ playlist } />
            </div>
            <div className='m-2'>
                <RadioTowerGlyph glyphTitle='Convert to station' className='w-8 h-8' onClick={ convertPlaylistToStationClickHandlerFactory(playlist, enqueueSnackbar) } />
            </div>
        </div>
    );
}

export function RenameableTitleContainer(
    { itemId, itemName, itemType = ShowerMusicObjectType.Playlist, children }:
        {
            itemId?: PlaylistId,
            itemName?: React.JSX.Element | string,
            itemType?: ShowerMusicObjectType.Playlist | ShowerMusicObjectType.Station,
            children?: React.ReactNode;
        })
{
    const { enqueueSnackbar } = useSnackbar();
    const { setGenericModalData, setGenericModalOpen } = useGlobalProps();
    const [ userCanRename, setUserCanRename ] = useState<boolean>(false);

    const playlistRenameInputTextField = useRef<HTMLInputElement>(null);

    useMemo(() =>
    {
        if (!itemId) { return; }
        if (itemType === ShowerMusicObjectType.Playlist)
        {
            setUserCanRename(true);
            return;
        }
        commandUserStationAccess(itemId)
            .then((access) =>
            {
                setUserCanRename(access.metadata);
            }).catch((_error) => { /* Ignore this error */ });
    }, [ itemId, itemType, setUserCanRename ]);

    const playlistRenameSubmitHandler = useCallback((event: FormEvent) =>
    {
        if (typeof window === 'undefined') { return; }
        if (itemId === undefined) { return; }
        const inputField = playlistRenameInputTextField.current;
        if (!inputField) { return; }
        commandRenamePlaylist(itemId, inputField.value)
            .then(() =>
            {
                enqueueSnackbar(`${capitalize(itemType)} has been renamed to ${inputField.value}`, { variant: 'success' });
                setGenericModalOpen(false);
            })
            .catch((error) =>
            {
                enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to rename ${itemType}!`, error);
            });
        event.preventDefault();
        event.stopPropagation();
    }, [ itemType, itemId, enqueueSnackbar, setGenericModalOpen ]);

    const playlistNameClickHandler = useCallback(() =>
    {
        if (typeof itemName !== 'string') { return; }
        if (!userCanRename) { return; }
        setGenericModalData(
            <>
                <Typography fontWeight={ 700 }>Renaming { '"' }{ itemName }{ '"' }</Typography>
                <form className='w-full' onSubmit={ playlistRenameSubmitHandler }>
                    <FormControl className='w-full'>
                        <FormGroup row={ true }>
                            <TextField
                                inputProps={ { className: 'text-white' } }
                                inputRef={ playlistRenameInputTextField }
                                id='playlist-rename-input-text-field'
                                placeholder={ `New ${itemType} name...` }
                                autoFocus={ true }
                                required={ true }
                                className='grow' />
                            <Box sx={ { width: '0.5em' } } />
                            <Button type='submit' variant='text' endIcon={ <SendIcon /> } onClick={ playlistRenameSubmitHandler }>Rename</Button>
                        </FormGroup>
                    </FormControl>
                </form>
            </>
        );
        setGenericModalOpen(true);
    }, [ itemName, itemType, userCanRename, playlistRenameSubmitHandler, setGenericModalData, setGenericModalOpen ]);

    if (!itemName || !itemId)
    {
        return (
            <ModalNameRectangleLoaderSkeleton />
        );
    }

    return (
        <div className='w-full h-full flex flex-col justify-flex-start items-center relative'>
            <div className='playlist-name' style={ { overflowWrap: 'break-word' } } onClick={ playlistNameClickHandler } data-user-can-rename={ userCanRename }>
                <Typography fontSize={ 'inherit' } className='playlist-name-text' fontWeight={ 900 }>{ itemName }</Typography>
                { userCanRename && <div className='rename-playlist-glyph'>
                    <RenameGlyph glyphTitle='Rename' />
                </div> }
            </div>
            <>
                { children }
            </>
        </div>
    );
}

export function ObjectCreatorTitleContainer(
    { itemData }: { itemData?: PlaylistAndStationBaseInterface; }
)
{
    const [ playlistCreatorName, setPlaylistCreatorName ] = useState<string>();
    const [ playlistCreatorId, setPlaylistCreatorId ] = useState<UserId | 'system'>();

    useMemo(() =>
    {
        if (!itemData) { return; }
        if (!itemData.creator) { return; }
        setPlaylistCreatorId(itemData.creator as unknown as string);
    }, [ itemData, setPlaylistCreatorId ]);

    useMemo(() =>
    {
        if (!playlistCreatorId) { return; }
        if (playlistCreatorId === 'system')
        {
            setPlaylistCreatorName(`Created by ShowerMusic`);
            return;
        }

        commandGetUserById(playlistCreatorId as unknown as string)
            .then((creatorInfo) =>
            {
                setPlaylistCreatorName(`Created by ${useUserPreferedName(creatorInfo)}`);
            }).catch((_error) =>
            {
                setPlaylistCreatorName(`Created by ShowerMusic`);
            });
    }, [ playlistCreatorId, setPlaylistCreatorName ]);

    return (
        <div className='playlist-creator-name'>
            <Typography fontWeight={ 600 }>{ playlistCreatorName ?? <ModalNameRectangleLoaderSkeleton /> }</Typography>
        </div>
    );
}

function PlaylistPageInsideSync({ playlistId }: { playlistId: PlaylistId; })
{
    const playlistData = useSharedSyncObject(playlistId, getPlaylist, MessageTypes.PLAYLIST_UPDATE);
    return (
        <ModalPageLoader
            itemId={ playlistId }
            itemType={ ShowerMusicObjectType.Playlist }
            itemData={ playlistData }
            customTitle={
                <RenameableTitleContainer itemId={ playlistId }   >
                    <ObjectCreatorTitleContainer itemData={ playlistData } />
                    <PlaylistSpecificSubInfo playlist={ playlistData as Playlist } />
                </RenameableTitleContainer> }
        />
    );
}

export default function PlaylistPage({ playlistId }: { playlistId: PlaylistId; })
{
    return (
        <SharedSyncObjectProvider id={ playlistId }>
            <PlaylistPageInsideSync playlistId={ playlistId } />
        </SharedSyncObjectProvider>
    );
}
