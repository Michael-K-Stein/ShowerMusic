import TrashCanGlyph from '@/app/components/glyphs/trash-can';
import CardModal from '@/app/components/media-modals/card-modal/card-modal';
import { deletePlaylistClickHandlerFactory } from '../playlist-page/playlist-callback-factories';
import useUserSession from '@/app/components/providers/user-provider/user-session';
import { MinimalPlaylist } from '@/app/shared-api/other/playlist';
import { Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import './home-page-playlists.css';

function UserPlaylistExtraModalControls({ minimalPlaylist }: { minimalPlaylist: MinimalPlaylist; })
{
    const { enqueueSnackbar } = useSnackbar();

    return (
        <>
            <div className='card-modal-add-glyph card-modal-delete-glyph' onClick={ deletePlaylistClickHandlerFactory(minimalPlaylist, enqueueSnackbar) }>
                <TrashCanGlyph glyphTitle='Delete' placement='right' />
            </div>
        </>
    );
}

export function UserPlaylist({ minimalPlaylist }: { minimalPlaylist: MinimalPlaylist; })
{
    return (
        <CardModal
            item={ minimalPlaylist }
            containsFullData={ true }
            extraControls={ <UserPlaylistExtraModalControls minimalPlaylist={ minimalPlaylist } /> }
        />
    );
}

export default function UserPlaylists({ ...props }: React.HTMLAttributes<HTMLDivElement>)
{
    const { userPlaylists } = useUserSession();

    const playlistElementItems = userPlaylists ? userPlaylists.map((playlist) =>
    {
        return (
            <UserPlaylist key={ playlist.id } minimalPlaylist={ playlist } />
        );
    }) : [];

    return (
        <div  { ...props }>
            <Typography variant='h4' fontWeight={ 700 }>Your playlists</Typography>
            { playlistElementItems.length === 0 &&
                <Typography fontWeight={ 500 }>You have yet to create a playlist</Typography> }
            <div className="home-page-playlists-container playlists-container">
                { playlistElementItems }
            </div>
        </div>
    );
}
