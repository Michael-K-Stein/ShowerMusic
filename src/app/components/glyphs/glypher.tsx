import { Tooltip, TooltipProps } from "@mui/material";
import React, { ReactElement } from "react";

export default function Glypher({ children, glyphTitle, placement, ...props }: { children: React.ReactElement<any, any>, glyphTitle: string, placement?: TooltipProps[ 'placement' ]; } & React.HTMLAttributes<HTMLDivElement>)
{
    return (
        <div { ...props }>
            <Tooltip title={ glyphTitle } placement={ placement }>
                { children }
            </Tooltip>
        </div>
    );
}
