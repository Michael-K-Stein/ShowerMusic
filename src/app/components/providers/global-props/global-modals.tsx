import { Modal, Box } from "@mui/material";
import { EnqueueSnackbar, OptionsObject, VariantType } from "notistack";

export function GenericGlobalModal(
    { genericModalData,
        genericModalOpen,
        setGenericModalOpen
    }: {
        genericModalData: React.JSX.Element | undefined,
        genericModalOpen: boolean;
        setGenericModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    }): React.JSX.Element
{
    if (!genericModalData)
    {
        return (<></>);
    }

    const style = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'rgba(20, 20, 25, 0.95)',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };

    return (
        <Modal
            open={ genericModalOpen }
            onClose={ () => { setGenericModalOpen(false); } }
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={ style }>
                { genericModalData }
            </Box>
        </Modal>
    );
}

export function reportGeneralServerErrorWithSnackbar(enqueueSnackbar: EnqueueSnackbar)
{
    enqueueSnackbar(`A general server error has occured!`, { variant: 'error' });
}

export function enqueueSnackbarWithSubtext(
    enqueueSnackbar: EnqueueSnackbar,
    mainText: string | React.ReactNode,
    subText: string | React.ReactNode,
    options?: OptionsObject<VariantType>
)
{
    enqueueSnackbar(<div className='flex flex-col'><p>{ mainText }</p><p style={ { fontSize: '0.7em' } }>{ subText }</p></div>, options);
}
