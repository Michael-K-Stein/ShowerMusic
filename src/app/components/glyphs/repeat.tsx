import "./glyphs.css"
import { Tooltip, TooltipProps } from "@mui/material";
import Glypher from "./glypher"
export default function RepeatGlyph({glyphTitle, placement, ...props} : {glyphTitle: string, placement?: TooltipProps[ "placement" ]} & React.HTMLAttributes<HTMLDivElement>){return(<Glypher glyphTitle={glyphTitle} placement={placement} { ...props }><div className="svg-glyph repeat-glyph"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" className="min-h-full min-w-full max-h-full max-w-full w-full h-full"><rect fill="transparent" stroke="none" width="100%" height="100%" />
  <path fill="none" stroke="currentColor" strokeWidth="4" d="M18 34L23 39 18 44M32 16L27 11 32 6" />
  <path fill="none" stroke="currentColor" strokeWidth="4" d="M28 11h11c1.657 0 3 1.343 3 3v22c0 1.657-1.343 3-3 3H27M22 39H11c-1.657 0-3-1.343-3-3V14c0-1.657 1.343-3 3-3h12" />
</svg></div></Glypher>);};