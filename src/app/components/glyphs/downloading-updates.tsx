import "./glyphs.css"
import { Tooltip, TooltipProps } from "@mui/material";
import Glypher from "./glypher"
export default function DownloadingUpdatesGlyph({glyphTitle, placement, ...props} : {glyphTitle: string, placement?: TooltipProps[ "placement" ]} & React.HTMLAttributes<HTMLDivElement>){return(<Glypher glyphTitle={glyphTitle} placement={placement} { ...props }><div className="svg-glyph downloading-updates-glyph"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" className="min-h-full min-w-full max-h-full max-w-full w-full h-full"><rect fill="transparent" stroke="none" width="100%" height="100%" />
  <path fill="none" stroke="currentColor" strokeWidth="4" d="M46,33v11.907C46,45.511,45.511,46,44.907,46H5.093C4.489,46,4,45.511,4,44.907V33" />
  <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M25 17L25 39M32 32L25 39 18 32" />
  <path d="M25 3A2 2 0 1 0 25 7 2 2 0 1 0 25 3zM25 9A2 2 0 1 0 25 13 2 2 0 1 0 25 9z" fill="currentColor" />
</svg></div></Glypher>);};