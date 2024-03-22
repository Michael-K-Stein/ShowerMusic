import { commandGetStation } from "@/app/client-api/stations/get-station-specific";
import { ModalPageLoader } from "@/app/components/pages/modal-page/modal-page";
import { PlaylistTitleContainer } from "@/app/components/pages/playlist-page/playlist-page";
import SharedSyncObjectProvider, { useSharedSyncObject } from "@/app/components/providers/shared-sync-object-provides";
import { StationId } from "@/app/shared-api/other/stations";
import { ShowerMusicObjectType } from "@/app/showermusic-object-types";


function StationPageInsideSync({ stationId }: { stationId: StationId; })
{
    const stationData = useSharedSyncObject(commandGetStation, stationId);
    return (
        <ModalPageLoader
            itemId={ stationId }
            itemType={ ShowerMusicObjectType.Station }
            itemData={ stationData }
            customTitle={ <PlaylistTitleContainer playlistId={ stationId } playlistData={ stationData } playlistName={ stationData?.name } /> }
        />
    );
}

export default function StationPage({ stationId }: { stationId: StationId; })
{
    return (
        <SharedSyncObjectProvider id={ stationId }>
            <StationPageInsideSync stationId={ stationId } />
        </SharedSyncObjectProvider>
    );
}
