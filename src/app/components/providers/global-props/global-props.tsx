import { commandCreateNewPlaylist } from "@/app/client-api/get-playlist";
import { commandQueueAddArbitraryTypeTracks, commandSetPlayNextArbitraryTypeTracks } from "@/app/client-api/queue";
import removeTrackFromArbitrary from "@/app/client-api/remove";
import { addArbitraryToQueueClickHandler, setPlayNextArbitraryClickHandler } from "@/app/components/providers/global-props/arbitrary-click-handler-factories";
import { GenericGlobalModal, enqueueApiErrorSnackbar, reportGeneralServerErrorWithSnackbar } from "@/app/components/providers/global-props/global-modals";
import { MediaId } from "@/app/shared-api/media-objects/media-id";
import { TrackDict } from "@/app/shared-api/media-objects/tracks";
import { RemovalId, ShowerMusicObjectType, ShowerMusicPlayableMediaDict } from "@/app/shared-api/other/common";
import { NewPlaylistInitOptions } from "@/app/shared-api/other/playlist";
import { ShowerMusicPlayableMediaType } from "@/app/showermusic-object-types";
import { EnqueueSnackbar, useSnackbar } from "notistack";
import { Dispatch, MouseEventHandler, SetStateAction, createContext, useCallback, useContext, useEffect, useState } from "react";

type GlobalPropsType = {
    isDefault: boolean;
    setGenericModalOpen: Dispatch<SetStateAction<boolean>>;
    genericModalOpen: boolean;
    setModalCloseCallback: Dispatch<SetStateAction<() => void>>;
    setGenericModalData: Dispatch<SetStateAction<JSX.Element | undefined>>;
    reportGeneralServerError: () => void;
};

const GlobalPropsContext = createContext<GlobalPropsType>({
    isDefault: true,
    setGenericModalOpen: () => { },
    genericModalOpen: false,
    setModalCloseCallback: () => { },
    setGenericModalData: () => { },
    reportGeneralServerError: () => { },
});

export const GlobalPropsProvider = ({ children }: { children: React.JSX.Element[] | React.JSX.Element; }) =>
{
    const [ genericModalOpen, setGenericModalOpen ] = useState(false);
    const [ genericModalData, setGenericModalData ] = useState<React.JSX.Element>();
    const modalCloseCallbackStub = useCallback(() => { return () => { }; }, []);
    const [ modalCloseCallback, setModalCloseCallback ] = useState(modalCloseCallbackStub);

    useEffect(() =>
    {
        if (genericModalOpen === false)
        {
            if (modalCloseCallback)
            {
                modalCloseCallback();
            }
        }
    }, [ genericModalOpen, modalCloseCallback ]);

    const { enqueueSnackbar } = useSnackbar();
    const reportGeneralServerError = useCallback(() => { reportGeneralServerErrorWithSnackbar(enqueueSnackbar); }, [ enqueueSnackbar ]);

    return (
        <GlobalPropsContext.Provider value={
            {
                isDefault: false,
                setGenericModalOpen,
                genericModalOpen,
                setModalCloseCallback,
                setGenericModalData,
                reportGeneralServerError,
            }
        }>
            { children }
            <GenericGlobalModal genericModalData={ genericModalData } genericModalOpen={ genericModalOpen } setGenericModalOpen={ setGenericModalOpen } />
        </GlobalPropsContext.Provider>
    );
};

export const useGlobalProps = () =>
{
    const context = useContext(GlobalPropsContext);

    if (context.isDefault)
    {
        throw new Error('useGlobalProps must be used within a GlobalPropsProvider');
    }

    return context;
};

export default useGlobalProps;


export const addTrackToQueueClickHandler = (track: TrackDict, enqueueSnackbar?: EnqueueSnackbar): MouseEventHandler =>
{
    return addArbitraryToQueueClickHandler(track, ShowerMusicObjectType.Track, enqueueSnackbar);
};

export const setPlayNextTrackClickHandler = (track: TrackDict, enqueueSnackbar?: EnqueueSnackbar): MouseEventHandler =>
{
    return setPlayNextArbitraryClickHandler(track, ShowerMusicObjectType.Track, enqueueSnackbar);
};

export const removeTrackClickHandler = (
    track: TrackDict,
    removalId: RemovalId,
    fromId: MediaId,
    fromType: ShowerMusicObjectType,
    enqueueSnackbar?: EnqueueSnackbar
): MouseEventHandler =>
{
    return (_event: React.MouseEvent<Element, MouseEvent>) =>
    {
        removeTrackFromArbitrary(removalId, track.name, fromId, fromType, enqueueSnackbar);
    };
};

export const newPlaylistClickHandler = (initOptions?: NewPlaylistInitOptions, enqueueSnackbar?: EnqueueSnackbar): MouseEventHandler =>
{
    return (_event: React.MouseEvent<Element, MouseEvent>) =>
    {
        commandCreateNewPlaylist(initOptions)
            .then((playlist) =>
            {
                if (enqueueSnackbar)
                {
                    enqueueSnackbar(`"${playlist.name}" has been created`, { variant: 'success' });
                }
            }).catch((e: any) =>
            {
                if (enqueueSnackbar)
                {
                    enqueueApiErrorSnackbar(enqueueSnackbar, `Failed to create new playlist`, e);
                }
            });
    };
};
