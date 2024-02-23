import { getTrackInfo } from "@/app/client-api/get-track";
import AddGlyph from "@/app/components/glyphs/add";
import AddSongGlyph from "@/app/components/glyphs/add-song";
import PlayPropertyGlyph from "@/app/components/glyphs/play-property";
import RemoveGlyph from "@/app/components/glyphs/remove";
import { enqueueApiErrorSnackbar } from "@/app/components/providers/global-props/global-modals";
import { addTrackToQueueClickHandler, removeTrackClickHandler, setPlayNextTrackClickHandler } from "@/app/components/providers/global-props/global-props";
import { useSessionState } from "@/app/components/providers/session/session";
import { ShowerMusicObjectType } from "@/app/settings";
import { TrackDict, TrackId } from "@/app/shared-api/media-objects/tracks";
import { RemovalId } from "@/app/shared-api/other/common";
import { useSnackbar } from "notistack";
import { useCallback, useMemo, useState } from "react";

export default function SuperMiniTrackControls({ track }: { track: TrackDict | TrackId | undefined; })
{
    const { enqueueSnackbar } = useSnackbar();
    const { setAddToArbitraryModalState } = useSessionState();
    const [ trackData, setTrackData ] = useState<TrackDict>();

    useMemo(() =>
    {
        if (typeof (track) === 'undefined')
        {
            // No work to do
        }
        else if (typeof (track) === 'string')
        {
            getTrackInfo(track)
                .then(setTrackData)
                .catch((e) =>
                {
                    enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to get track info!`, e);
                });
        }
        else
        {
            setTrackData(track);
        }
    }, [ setTrackData, track, enqueueSnackbar ]);

    const clickDispatcher = useCallback((dispatchFunction: any) =>
    {
        return trackData ?
            dispatchFunction(trackData, enqueueSnackbar) :
            () => { enqueueSnackbar(`Track data has not yet been loaded...`, { variant: 'warning' }); };
    }, [ trackData, enqueueSnackbar ]);

    const addToArbitraryClickHandler = (event: React.MouseEvent<HTMLElement, MouseEvent>) =>
    {
        if (!trackData) { return; }
        setAddToArbitraryModalState({
            posX: event.clientX,
            posY: event.clientY,
            event: event,
            mediaData: trackData,
            mediaType: ShowerMusicObjectType.Track,
        });
    };

    return (
        <div className="flex flex-row items-center">
            <div className='super-mini-track-control' onClick={ clickDispatcher(addTrackToQueueClickHandler) }>
                <AddSongGlyph glyphTitle='Add to queue' />
            </div>
            <div className='super-mini-track-control' onClick={ clickDispatcher(setPlayNextTrackClickHandler) }>
                <PlayPropertyGlyph glyphTitle='Play next' />
            </div >
            <div className='super-mini-track-control' onClick={ addToArbitraryClickHandler }>
                <AddGlyph glyphTitle='Add to' />
            </div>
        </div >
    );
}


export function SuperMiniTrackEndControls(
    { track, removalId, fromId, fromType }: {
        track: TrackDict | TrackId | undefined,
        removalId?: RemovalId,
        fromId?: string,
        fromType?: ShowerMusicObjectType;
    }
)
{
    const { enqueueSnackbar } = useSnackbar();
    const [ trackData, setTrackData ] = useState<TrackDict>();

    useMemo(() =>
    {
        if (removalId === undefined || fromId === undefined || fromType === undefined) { return; };
        if (typeof (track) === 'undefined')
        {
            // No work to do
        }
        else if (typeof (track) === 'string')
        {
            getTrackInfo(track)
                .then(setTrackData)
                .catch((e) =>
                {
                    enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to get track info!`, e);
                });
        }
        else
        {
            setTrackData(track);
        }
    }, [ setTrackData, track, enqueueSnackbar, removalId, fromId, fromType ]);

    const clickDispatcher = useCallback((dispatchFunction: any) =>
    {
        return trackData ?
            dispatchFunction(trackData, removalId, fromId, fromType, enqueueSnackbar) :
            () => { enqueueSnackbar(`Track data has not yet been loaded...`, { variant: 'warning' }); };
    }, [ trackData, enqueueSnackbar, removalId, fromId, fromType ]);

    if (removalId === undefined || fromId === undefined || fromType === undefined) { return (<></>); };

    return (
        <div className="flex flex-row items-center">
            <div className='super-mini-track-control' onClick={ clickDispatcher(removeTrackClickHandler) }>
                <RemoveGlyph glyphTitle='Remove' placement="left" />
            </div>
        </div >
    );
}
