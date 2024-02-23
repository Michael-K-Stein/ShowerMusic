import "./glyphs.css"
import { Tooltip, TooltipProps } from "@mui/material";
import Glypher from "./glypher"
export default function LoveCircledGlyph({glyphTitle, placement, ...props} : {glyphTitle: string, placement?: TooltipProps[ "placement" ]} & React.HTMLAttributes<HTMLDivElement>){return(<Glypher glyphTitle={glyphTitle} placement={placement} { ...props }><div className="svg-glyph love-circled-glyph"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" className="min-h-full min-w-full max-h-full max-w-full w-full h-full"><rect fill="transparent" stroke="none" width="100%" height="100%" />
  <path d="M25,2C12.317,2,2,12.318,2,25s10.317,23,23,23s23-10.318,23-23S37.683,2,25,2z M25.5,35.8l-0.6,0.5l-0.6-0.5C23.8,35.3,14,29,14,23.4c0-3.5,2.4-6.4,6-6.4c3,0,5,3,5,3s2-3,5-3c3.6,0,6,2.9,6,6.4C36,29,26,35.4,25.5,35.8z" fill="currentColor" />
</svg></div></Glypher>);};