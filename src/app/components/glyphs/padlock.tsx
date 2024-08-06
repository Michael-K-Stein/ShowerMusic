import "./glyphs.css"
import { Tooltip, TooltipProps } from "@mui/material";
import Glypher from "./glypher"
export default function PadlockGlyph({glyphTitle, placement, ...props} : {glyphTitle: string, placement?: TooltipProps[ "placement" ]} & React.HTMLAttributes<HTMLDivElement>){return(<Glypher glyphTitle={glyphTitle} placement={placement} { ...props }><div className="svg-glyph padlock-glyph"><svg xmlns="http://www.w3.org/2000/svg" className="min-h-full min-w-full max-h-full max-w-full w-full h-full" viewBox="0 0 50 50"><rect fill="transparent" stroke="none" width="100%" height="100%" />
  <path fill="none" d="M0 0H50V50H0z" />
  <path fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M34.6,13.1c0,0-1.1-3.6-1.3-4.3c-1.8-5.8-8-9.1-13.8-7.3c-5.8,1.8-9.1,8-7.3,13.8C12.6,16.4,14,21,14,21" />
  <path d="M41,20H9c-1.7,0-3,1.3-3,3v24c0,1.7,1.3,3,3,3h32c1.7,0,3-1.3,3-3V23C44,21.3,42.7,20,41,20z M27,35.2V38c0,1.1-0.9,2-2,2s-2-0.9-2-2v-2.8c-0.6-0.5-1-1.3-1-2.2c0-1.7,1.3-3,3-3s3,1.3,3,3C28,33.9,27.6,34.7,27,35.2z" fill="currentColor" />
</svg></div></Glypher>);};