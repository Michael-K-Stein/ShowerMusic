'use client';
import { SetStateAction, createContext, useContext, useState } from "react";

type ModalContextType = {
    isDefault: boolean;
    isHovered: boolean;
    setIsHovered: React.Dispatch<SetStateAction<boolean>>;
};

export const ModalContext = createContext<ModalContextType>({
    isDefault: true,
    isHovered: false,
    setIsHovered: () => { },
});

const ModalProvider = (
    { children }: { children: React.ReactNode; }
) =>
{
    const [ isHovered, setIsHovered ] = useState<boolean>(false);

    return (
        <ModalContext.Provider value={
            {
                isDefault: false,
                isHovered, setIsHovered,
            }
        }>
            { children }
        </ModalContext.Provider>
    );
};

export const useModalContext = () =>
{
    const context = useContext(ModalContext);

    // If the caller explicitly states that this is NOT required, it is allowed to not
    //  be within a provider.
    if (context.isDefault)
    {
        throw new Error(`useModalContext must be used within a ModalProvider!`);
    }

    return context;
};


export default ModalProvider;