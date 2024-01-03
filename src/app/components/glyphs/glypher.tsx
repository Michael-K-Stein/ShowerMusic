import { Tooltip } from "@mui/material";
import { ReactElement } from "react";

export default function Glypher( { children, glyphTitle } : { children: React.ReactElement<any, any>, glyphTitle: string } )
{
    return (
        <Tooltip title={glyphTitle}>
            { children }
        </Tooltip>
    );
}