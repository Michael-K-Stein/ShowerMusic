import "./glyphs.css"
import { Tooltip, TooltipProps } from "@mui/material";
import Glypher from "./glypher"
export default function BackToGlyph({glyphTitle, placement, ...props} : {glyphTitle: string, placement?: TooltipProps[ "placement" ]} & React.HTMLAttributes<HTMLDivElement>){return(<Glypher glyphTitle={glyphTitle} placement={placement} { ...props }><div className="svg-glyph back-to-glyph"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" className="min-h-full min-w-full max-h-full max-w-full w-full h-full"><rect fill="transparent" stroke="none" width="100%" height="100%" />
  <path d="M25,2C12.318,2,2,12.318,2,25c0,12.683,10.318,23,23,23c12.683,0,23-10.317,23-23C48,12.318,37.683,2,25,2z M28.707,34.293c0.391,0.391,0.391,1.023,0,1.414C28.512,35.902,28.256,36,28,36s-0.512-0.098-0.707-0.293l-10-10c-0.391-0.391-0.391-1.023,0-1.414l10-10c0.391-0.391,1.023-0.391,1.414,0s0.391,1.023,0,1.414L19.414,25L28.707,34.293z" fill="currentColor" />
</svg></div></Glypher>);};