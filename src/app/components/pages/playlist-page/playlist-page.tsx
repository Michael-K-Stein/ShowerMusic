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
import { Box, Button, FormControl, FormGroup, TextField, Typography } from '@mui/material';
import useGlobalProps from '@/app/components/providers/global-props/global-props';
import SendIcon from '@mui/icons-material/Send';
import commandGetUserById from '@/app/client-api/users/get-user';
import { ModalPageLoader } from '@/app/components/pages/modal-page/modal-page';
import { commandUserStationAccess } from '@/app/client-api/stations/get-station-specific';

export function PlaylistTitleContainer(
    { playlistId, playlistData, playlistName }:
        { playlistId?: PlaylistId, playlistName?: React.JSX.Element | string, playlistData?: PlaylistAndStationBaseInterface; })
{
    const { enqueueSnackbar } = useSnackbar();
    const { setGenericModalData, setGenericModalOpen } = useGlobalProps();
    const [ playlistCreatorName, setPlaylistCreatorName ] = useState<string>();
    const [ userCanRename, setUserCanRename ] = useState<boolean>(false);

    const playlistRenameInputTextField = useRef<HTMLInputElement>(null);

    useMemo(() =>
    {
        if (!playlistId || !playlistData) { return; }
        if (playlistData.type === ShowerMusicObjectType.Playlist)
        {
            setUserCanRename(true);
            return;
        }
        commandUserStationAccess(playlistId)
            .then((access) =>
            {
                setUserCanRename(access.metadata);
            }).catch((_error) => { /* Ignore this error */ });
    }, [ playlistId, playlistData, setUserCanRename ]);

    const playlistRenameSubmitHandler = useCallback((event: FormEvent) =>
    {
        if (typeof window === 'undefined') { return; }
        if (playlistId === undefined) { return; }
        const inputField = playlistRenameInputTextField.current;
        if (!inputField) { return; }
        commandRenamePlaylist(playlistId, inputField.value)
            .then(() =>
            {
                enqueueSnackbar(`Playlist has been renamed to ${inputField.value}`, { variant: 'success' });
                setGenericModalOpen(false);
            })
            .catch((error) =>
            {
                enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to rename playlist!`, error);
            });
        event.preventDefault();
        event.stopPropagation();
    }, [ playlistId, enqueueSnackbar, setGenericModalOpen ]);

    const playlistNameClickHandler = useCallback(() =>
    {
        if (typeof playlistName !== 'string') { return; }
        if (!userCanRename) { return; }
        setGenericModalData(
            <>
                <Typography>Renaming { '"' }{ playlistName }{ '"' }</Typography>
                <form className='w-full' onSubmit={ playlistRenameSubmitHandler }>
                    <FormControl className='w-full'>
                        <FormGroup row={ true }>
                            <TextField
                                inputRef={ playlistRenameInputTextField }
                                id='playlist-rename-input-text-field'
                                placeholder='New playlist name...'
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
    }, [ playlistName, userCanRename, playlistRenameSubmitHandler, setGenericModalData, setGenericModalOpen ]);

    useMemo(() =>
    {
        if (!playlistData) { return; }
        commandGetUserById(playlistData.creator as unknown as string)
            .then((creatorInfo) =>
            {
                setPlaylistCreatorName(`Created by ${creatorInfo.username}`);
            }).catch((_error) =>
            {
                setPlaylistCreatorName(`Created by ShowerMusic`);
            });
    }, [ playlistData, setPlaylistCreatorName ]);

    if (!playlistName || !playlistId)
    {
        return (
            <ModalNameRectangleLoaderSkeleton />
        );
    }

    return (
        <>
            <div className='playlist-name' style={ { overflowWrap: 'break-word' } } onClick={ playlistNameClickHandler } data-user-can-rename={ userCanRename }>
                <Typography fontSize={ 'inherit' } className='playlist-name-text'>{ playlistName }</Typography>
                { userCanRename && <div className='rename-playlist-glyph'>
                    <RenameGlyph glyphTitle='Rename' />
                </div> }
            </div>
            <div className='playlist-creator-name'>
                <Typography>{ playlistCreatorName ?? <ModalNameRectangleLoaderSkeleton /> }</Typography>
            </div>
        </>
    );
}

function PlaylistPageInsideSync({ playlistId }: { playlistId: PlaylistId; })
{
    const playlistData = useSharedSyncObject(getPlaylist, playlistId);
    return (
        <ModalPageLoader
            itemId={ playlistId }
            itemType={ ShowerMusicObjectType.Playlist }
            itemData={ playlistData }
            customTitle={ <PlaylistTitleContainer playlistId={ playlistId } playlistData={ playlistData } playlistName={ playlistData?.name } /> }
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
