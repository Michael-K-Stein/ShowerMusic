import KeyboardNavigation from "@/app/components/keyboard-navigation";
import { Tooltip, TooltipProps } from "@mui/material";
import React, { KeyboardEvent, useCallback } from "react";
import './glyphs.css';

export default function Glypher({ children, glyphTitle, placement, className, onClick, tabIndex, ...props }: { children: React.ReactElement<any, any>, glyphTitle: string, placement?: TooltipProps[ 'placement' ]; } & React.HTMLAttributes<HTMLDivElement>)
{
    const keyDownHandler = useCallback((event: KeyboardEvent<HTMLDivElement>) =>
    {
        if (typeof onClick === 'undefined') { return; }
        if (KeyboardNavigation.isClick(event))
        {
            event.preventDefault();
            event.stopPropagation();

            // Simulate a mouse click by calling onClick with a MouseEvent
            const mouseEvent = KeyboardNavigation.keyboardToMouseClickEvent(event);
            onClick(mouseEvent);
        }
    }, [ onClick ]);

    return (
        <div
            { ...props }
            onClick={ onClick }
            onKeyDown={ keyDownHandler }
            className={ `flex flex-row items-center justify-center ${className ?? ''}` }
            tabIndex={ (tabIndex !== undefined) ? tabIndex : ((typeof onClick !== 'undefined') ? 0 : -1) }
        >
            <Tooltip title={ glyphTitle } placement={ placement }>
                { children }
            </Tooltip>
        </div>
    );
}
