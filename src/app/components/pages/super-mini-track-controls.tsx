import { getTrackInfo } from "@/app/client-api/get-track";
import AddGlyph from "@/app/components/glyphs/add";
import AddSongGlyph from "@/app/components/glyphs/add-song";
import LoveCircledGlyph from "@/app/components/glyphs/love-circled";
import PlayPropertyGlyph from "@/app/components/glyphs/play-property";
import RemoveGlyph from "@/app/components/glyphs/remove";
import ItemFavoriteGlyph from "@/app/components/other/item-favorite-glyph";
import { enqueueApiErrorSnackbar } from "@/app/components/providers/global-props/global-modals";
import { addTrackToQueueClickHandler, removeTrackClickHandler, setPlayNextTrackClickHandler } from "@/app/components/providers/global-props/global-props";
import { useSessionState } from "@/app/components/providers/session/session";
import { ShowerMusicObjectType } from "@/app/settings";
import { TrackDict, TrackId } from "@/app/shared-api/media-objects/tracks";
import { RemovalId, ShowerMusicPlayableMediaDict } from "@/app/shared-api/other/common";
import { ShowerMusicNamedResolveableItem } from "@/app/shared-api/user-objects/users";
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
        <div className="flex flex-row items-center w-full" tabIndex={ -1 }>
            <AddSongGlyph glyphTitle='Add to queue' className='super-mini-track-control' onClick={ clickDispatcher(addTrackToQueueClickHandler) } tabIndex={ -1 } />
            <PlayPropertyGlyph glyphTitle='Play next' className='super-mini-track-control' onClick={ clickDispatcher(setPlayNextTrackClickHandler) } tabIndex={ -1 } />
            <AddGlyph glyphTitle='Add to' className='super-mini-track-control' onClick={ addToArbitraryClickHandler } tabIndex={ -1 } />
            <ItemFavoriteGlyph
                item={ trackData as (ShowerMusicPlayableMediaDict | ShowerMusicNamedResolveableItem) }
                itemType={ ShowerMusicObjectType.Track }
                className='super-mini-track-control'
                passThroughHtmlProps={ { className: 'flex flex-row items-center', tabIndex: -1 } }
                tabIndex={ -1 }
            />
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
