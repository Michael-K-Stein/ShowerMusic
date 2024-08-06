import "./glyphs.css"
import { Tooltip, TooltipProps } from "@mui/material";
import Glypher from "./glypher"
export default function MusicHeartGlyph({glyphTitle, placement, ...props} : {glyphTitle: string, placement?: TooltipProps[ "placement" ]} & React.HTMLAttributes<HTMLDivElement>){return(<Glypher glyphTitle={glyphTitle} placement={placement} { ...props }><div className="svg-glyph music-heart-glyph"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="min-h-full min-w-full max-h-full max-w-full w-full h-full"><rect fill="transparent" stroke="none" width="100%" height="100%" />
  <path fill="#f44336" d="M34,6c-4.176,0-7.852,2.137-10,5.371C21.852,8.137,18.176,6,14,6C7.371,6,2,11.371,2,18 c0,11.941,22,24,22,24s22-11.953,22-24C46,11.371,40.629,6,34,6" />
  <path fill="#ffebee" d="M26,28.5c0,2.484-2.016,4.5-4.5,4.5S17,30.984,17,28.5s2.016-4.5,4.5-4.5S26,26.016,26,28.5z" />
  <path fill="#ffebee" d="M31,16.898L24,15v13.5h2V19l5,1.398V16.898z" />
</svg></div></Glypher>);};