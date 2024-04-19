import "./glyphs.css"
import { Tooltip, TooltipProps } from "@mui/material";
import Glypher from "./glypher"
export default function LoginRoundedUpGlyph({glyphTitle, placement, ...props} : {glyphTitle: string, placement?: TooltipProps[ "placement" ]} & React.HTMLAttributes<HTMLDivElement>){return(<Glypher glyphTitle={glyphTitle} placement={placement} { ...props }><div className="svg-glyph login-rounded-up-glyph"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" className="min-h-full min-w-full max-h-full max-w-full w-full h-full"><rect fill="transparent" stroke="none" width="100%" height="100%" />
  <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M25 46L25 17M18 23L25 16 32 23" />
  <path fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="4" d="M33,44.369c7.626-3.148,13-10.641,13-19.404c0-11.598-9.402-21-21-21s-21,9.402-21,21c0,8.762,5.374,16.256,13,19.404" />
</svg></div></Glypher>);};