import "./glyphs.css"
import { Tooltip, TooltipProps } from "@mui/material";
import Glypher from "./glypher"
export default function RadioTowerGlyph({glyphTitle, placement, ...props} : {glyphTitle: string, placement?: TooltipProps[ "placement" ]} & React.HTMLAttributes<HTMLDivElement>){return(<Glypher glyphTitle={glyphTitle} placement={placement} { ...props }><div className="svg-glyph radio-tower-glyph"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="min-h-full min-w-full max-h-full max-w-full w-full h-full"><rect fill="transparent" stroke="none" width="100%" height="100%" />
  <path fill="none" stroke="currentColor" strokeWidth="2" d="M21 27L16 13 11 27M9 27L13 27M19 27L23 27M21.4 8c2.2 2.2 2.2 5.8 0 8M24.1 5c3.9 3.9 3.9 10.1 0 14M10.6 15.9c-2.2-2.2-2.2-5.8 0-8M7.9 18.9C4 15 4 8.7 7.9 4.9" />
  <path d="M16 10A2 2 0 1 0 16 14A2 2 0 1 0 16 10Z" fill="currentColor" />
</svg></div></Glypher>);};