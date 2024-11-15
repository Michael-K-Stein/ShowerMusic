import "./glyphs.css"
import { Tooltip, TooltipProps } from "@mui/material";
import Glypher from "./glypher"
export default function SaveAsGlyph({glyphTitle, placement, ...props} : {glyphTitle: string, placement?: TooltipProps[ "placement" ]} & React.HTMLAttributes<HTMLDivElement>){return(<Glypher glyphTitle={glyphTitle} placement={placement} { ...props }><div className="svg-glyph save-as-glyph"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" className="min-h-full min-w-full max-h-full max-w-full w-full h-full"><rect fill="transparent" stroke="none" width="100%" height="100%" />
  <path d="M33,6h-3c-0.553,0-1,0.447-1,1v9c0,0.553,0.447,1,1,1h3c0.553,0,1-0.447,1-1V7C34,6.447,33.553,6,33,6z" fill="currentColor" />
  <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M47.68 24.694L31.978 40.396 26 42 27.603 36.022 43.306 20.321" />
  <path d="M48.115 25.648c-.004.003.69-.691.69-.691 1.592-1.592 1.592-4.173.002-5.764-1.594-1.593-4.174-1.591-5.765 0 0 0-.695.695-.691.691L48.115 25.648zM27.749 35.877L32.123 40.251 26.378 41.622z" fill="currentColor" />
  <path d="M39.975,36.633V46H10.025V28.8c0-1.53,1.244-2.774,2.774-2.774h20.57l8.259-8.247c1.72-1.72,4.221-2.174,6.372-1.395V12c0-0.266-0.105-0.52-0.293-0.707l-9-9C38.52,2.105,38.266,2,38,2H5C3.346,2,2,3.346,2,5v40c0,1.654,1.346,3,3,3h40c1.654,0,3-1.346,3-3V28.594L39.975,36.633z M8,43H6v-2h2V43z M10,6c0-1.103,0.897-2,2-2h23c1.103,0,2,0.897,2,2v11c0,1.103-0.897,2-2,2H12c-1.103,0-2-0.897-2-2V6z M44,43h-2v-2h2V43z" fill="currentColor" />
</svg></div></Glypher>);};