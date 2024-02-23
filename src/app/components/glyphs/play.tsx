import "./glyphs.css"
import { Tooltip, TooltipProps } from "@mui/material";
import Glypher from "./glypher"
export default function PlayGlyph({glyphTitle, placement, ...props} : {glyphTitle: string, placement?: TooltipProps[ "placement" ]} & React.HTMLAttributes<HTMLDivElement>){return(<Glypher glyphTitle={glyphTitle} placement={placement} { ...props }><div className="svg-glyph play-glyph"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" className="min-h-full min-w-full max-h-full max-w-full w-full h-full"><rect fill="transparent" stroke="none" width="100%" height="100%" />
  <path d="M10,5.251v39.497L43.572,25L10,5.251z" fill="currentColor" />
</svg></div></Glypher>);};