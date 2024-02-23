import "./glyphs.css"
import { Tooltip, TooltipProps } from "@mui/material";
import Glypher from "./glypher"
export default function TrashCanGlyph({glyphTitle, placement, ...props} : {glyphTitle: string, placement?: TooltipProps[ "placement" ]} & React.HTMLAttributes<HTMLDivElement>){return(<Glypher glyphTitle={glyphTitle} placement={placement} { ...props }><div className="svg-glyph trash-can-glyph"><svg xmlns="http://www.w3.org/2000/svg" className="min-h-full min-w-full max-h-full max-w-full w-full h-full" viewBox="0 0 50 50"><rect fill="transparent" stroke="none" width="100%" height="100%" />
  <path fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M19 8V5c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v3M8 8L42 8" />
  <path d="M9,8v37c0,1.654,1.346,3,3,3h26c1.654,0,3-1.346,3-3V8H9z M20,40c0,0.553-0.448,1-1,1s-1-0.447-1-1V15c0-0.552,0.448-1,1-1s1,0.448,1,1V40z M26,40c0,0.553-0.448,1-1,1s-1-0.447-1-1V15c0-0.552,0.448-1,1-1s1,0.448,1,1V40z M32,40c0,0.553-0.447,1-1,1s-1-0.447-1-1V15c0-0.552,0.447-1,1-1s1,0.448,1,1V40z" fill="currentColor" />
</svg></div></Glypher>);};