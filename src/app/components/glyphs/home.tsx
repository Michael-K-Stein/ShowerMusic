import "./glyphs.css"
import { Tooltip, TooltipProps } from "@mui/material";
import Glypher from "./glypher"
export default function HomeGlyph({glyphTitle, placement, ...props} : {glyphTitle: string, placement?: TooltipProps[ "placement" ]} & React.HTMLAttributes<HTMLDivElement>){return(<Glypher glyphTitle={glyphTitle} placement={placement} { ...props }><div className="svg-glyph home-glyph"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" className="min-h-full min-w-full max-h-full max-w-full w-full h-full"><rect fill="transparent" stroke="none" width="100%" height="100%" />
  <path d="M41 5L41 10.73 35 6.05 35 5zM48.79 20.62C48.59 20.87 48.3 21 48 21c-.22 0-.43-.07-.62-.21L46 19.71V46c0 .55-.45 1-1 1H31V29H19v18H5c-.55 0-1-.45-1-1V19.71l-1.38 1.08c-.44.34-1.07.26-1.41-.17-.34-.44-.26-1.07.17-1.41l23-17.95c.37-.28.87-.28 1.24 0l23 17.95C49.05 19.55 49.13 20.18 48.79 20.62z" fill="currentColor" />
</svg></div></Glypher>);};