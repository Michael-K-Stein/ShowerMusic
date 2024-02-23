import './home-page-playlists.css';
import '@/app/components/media-modals/card-modal.css';
import { UserDict } from "@/app/shared-api/user-objects/users";
import { MinimalPlaylist } from '@/app/shared-api/other/playlist';
import { Typography } from '@mui/material';
import { PlaylistImage, addPlaylistToArbitraryClickHandlerFactory, addToQueuePlaylistClickHandlerFactory, deletePlaylistClickHandlerFactory, gotoPlaylistCallbackFactory, playPlaylistClickHandlerFactory } from '@/app/components/pages/playlist-page/playlist-page';
import { useSessionState } from '@/app/components/providers/session/session';
import { useSnackbar } from 'notistack';
import PlayGlyph from '@/app/components/glyphs/play';
import AddSongGlyph from '@/app/components/glyphs/add-song';
import AddGlyph from '@/app/components/glyphs/add';
import TrashCanGlyph from '@/app/components/glyphs/trash-can';
import useUserSession from '@/app/components/providers/user-provider/user-session';

function UserPlaylistModalControls({ minimalPlaylist }: { minimalPlaylist: MinimalPlaylist; })
{
    const { enqueueSnackbar } = useSnackbar();
    const { setAddToArbitraryModalState, setStream } = useSessionState();

    return (
        <div className='card-modal-controls-parent absolute w-6 h-6 top-2 right-2 flex flex-col' onClick={ (event) => { event.stopPropagation(); } }>
            <div className='card-modal-controls'>
                <div className='card-modal-add-glyph' onClick={ playPlaylistClickHandlerFactory(minimalPlaylist, setStream, enqueueSnackbar) }>
                    <PlayGlyph glyphTitle='Play' placement='right' />
                </div>
                <div className='card-modal-add-glyph' onClick={ addToQueuePlaylistClickHandlerFactory(minimalPlaylist, enqueueSnackbar) }>
                    <AddSongGlyph glyphTitle='Add to queue' placement='right' />
                </div>
                <div className='card-modal-add-glyph' onClick={ addPlaylistToArbitraryClickHandlerFactory(minimalPlaylist, setAddToArbitraryModalState) }>
                    <AddGlyph glyphTitle='Add to' placement='right' />
                </div>
                <div className='card-modal-add-glyph card-modal-delete-glyph' onClick={ deletePlaylistClickHandlerFactory(minimalPlaylist, enqueueSnackbar) }>
                    <TrashCanGlyph glyphTitle='Delete' placement='right' />
                </div>
            </div>
        </div >
    );
}

export function UserPlaylist({ minimalPlaylist }: { minimalPlaylist: MinimalPlaylist; })
{
    const { setView } = useSessionState();
    return (
        <div className='card-modal' id={ minimalPlaylist.id } onClick={ gotoPlaylistCallbackFactory(setView, minimalPlaylist.id) }>
            <div className='card-modal-cover-art'>
                <div className='playlist-image'>
                    <PlaylistImage playlistInitData={ minimalPlaylist } />
                </div>
            </div>
            <div className='card-modal-text-content'>
                <Typography variant='h5'>
                    { minimalPlaylist.name }
                </Typography>
            </div>
            <UserPlaylistModalControls minimalPlaylist={ minimalPlaylist } />
        </div>
    );
}

export default function UserPlaylists()
{
    const { userPlaylists } = useUserSession();

    const playlistElementItems = userPlaylists ? userPlaylists.map((playlist) =>
    {
        return (
            <UserPlaylist key={ playlist.id } minimalPlaylist={ playlist } />
        );
    }) : [];

    return (
        <div>
            <Typography variant='h4'>Your playlists</Typography>
            { playlistElementItems.length === 0 &&
                <Typography className='ml-4'>You have yet to create a playlist</Typography> }
            <div className="home-page-playlists-container playlists-container">
                { playlistElementItems }
            </div>
        </div>
    );
}
