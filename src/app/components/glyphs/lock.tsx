import "./glyphs.css"
import { Tooltip, TooltipProps } from "@mui/material";
import Glypher from "./glypher"
export default function LockGlyph({glyphTitle, placement, ...props} : {glyphTitle: string, placement?: TooltipProps[ "placement" ]} & React.HTMLAttributes<HTMLDivElement>){return(<Glypher glyphTitle={glyphTitle} placement={placement} { ...props }><div className="svg-glyph lock-glyph"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" className="min-h-full min-w-full max-h-full max-w-full w-full h-full"><rect fill="transparent" stroke="none" width="100%" height="100%" />
  <path fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M36,21c0,0,0-4.9,0-6c0-6.1-4.9-11-11-11c-6.1,0-11,4.9-11,11c0,1.1,0,6,0,6" />
  <path fill="none" d="M0 0H50V50H0z" />
  <path d="M41,20H9c-1.7,0-3,1.3-3,3v24c0,1.7,1.3,3,3,3h32c1.7,0,3-1.3,3-3V23C44,21.3,42.7,20,41,20z M27,35.2V38c0,1.1-0.9,2-2,2s-2-0.9-2-2v-2.8c-0.6-0.5-1-1.3-1-2.2c0-1.7,1.3-3,3-3c1.7,0,3,1.3,3,3C28,33.9,27.6,34.7,27,35.2z" fill="currentColor" />
</svg></div></Glypher>);};