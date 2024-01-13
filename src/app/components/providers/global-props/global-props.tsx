import { addTrackToQueue } from "@/app/client-api/queue";
import { GenericGlobalModal, reportGeneralServerErrorWithSnackbar } from "@/app/components/providers/global-props/global-modals";
import { TrackDict } from "@/app/shared-api/media-objects/tracks";
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
    return (_event: React.MouseEvent<Element, MouseEvent>) =>
    {
        addTrackToQueue(track.id)
            .then((_v) =>
            {
                if (enqueueSnackbar)
                {
                    enqueueSnackbar(`"${track.name}" has been added to your queue`, { variant: 'success' });
                }
            }).catch((_e) =>
            {
                if (enqueueSnackbar)
                {
                    enqueueSnackbar(`Failed to add "${track.name}" to your queue`, { variant: 'error' });
                }
            });
    };
};