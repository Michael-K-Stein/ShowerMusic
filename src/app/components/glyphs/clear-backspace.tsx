import "./glyphs.css"
import { Tooltip, TooltipProps } from "@mui/material";
import Glypher from "./glypher"
export default function ClearBackspaceGlyph({glyphTitle, placement, ...props} : {glyphTitle: string, placement?: TooltipProps[ "placement" ]} & React.HTMLAttributes<HTMLDivElement>){return(<Glypher glyphTitle={glyphTitle} placement={placement} { ...props }><div className="svg-glyph clear-backspace-glyph"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" className="min-h-full min-w-full max-h-full max-w-full w-full h-full"><rect fill="transparent" stroke="none" width="100%" height="100%" />
  <path d="M46,10H12.54L-0.317,25L12.54,40H46c2.206,0,4-1.794,4-4V14C50,11.794,48.206,10,46,10z M34.707,30.293l-1.414,1.414L28,26.414l-5.293,5.293l-1.414-1.414L26.586,25l-5.293-5.293l1.414-1.414L28,23.586l5.293-5.293l1.414,1.414L29.414,25L34.707,30.293z" fill="currentColor" />
</svg></div></Glypher>);};