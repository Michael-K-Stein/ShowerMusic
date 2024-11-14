import "./glyphs.css"
import { Tooltip, TooltipProps } from "@mui/material";
import Glypher from "./glypher"
export default function StarHalfGlyph({glyphTitle, placement, ...props} : {glyphTitle: string, placement?: TooltipProps[ "placement" ]} & React.HTMLAttributes<HTMLDivElement>){return(<Glypher glyphTitle={glyphTitle} placement={placement} { ...props }><div className="svg-glyph star-half-glyph"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" className="min-h-full min-w-full max-h-full max-w-full w-full h-full"><rect fill="transparent" stroke="none" width="100%" height="100%" />
  <path d="M10.2,48.6c-0.2,0-0.4-0.1-0.6-0.2c-0.3-0.2-0.5-0.7-0.4-1.1L13.6,31L0.4,20.2C0,19.9-0.1,19.5,0,19.1c0.1-0.4,0.5-0.7,0.9-0.7l17-0.9l6.2-15.9c0.2-0.4,0.6-0.7,1.1-0.6C25.7,1.1,26,1.5,26,2v36.1c0,0.3-0.2,0.7-0.5,0.8l-14.8,9.5C10.6,48.5,10.4,48.6,10.2,48.6z M25,38.1L25,38.1L25,38.1z" fill="currentColor" />
</svg></div></Glypher>);};