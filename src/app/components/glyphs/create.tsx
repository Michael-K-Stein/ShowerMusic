import "./glyphs.css"
import { Tooltip, TooltipProps } from "@mui/material";
import Glypher from "./glypher"
export default function CreateGlyph({glyphTitle, placement, ...props} : {glyphTitle: string, placement?: TooltipProps[ "placement" ]} & React.HTMLAttributes<HTMLDivElement>){return(<Glypher glyphTitle={glyphTitle} placement={placement} { ...props }><div className="svg-glyph create-glyph"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" className="min-h-full min-w-full max-h-full max-w-full w-full h-full"><rect fill="transparent" stroke="none" width="100%" height="100%" />
  <path d="M15.979,28.92l17.025-16.898l2-2H2.979c-0.553,0-1,0.448-1,1v36c0,0.552,0.447,1,1,1h36c0.553,0,1-0.448,1-1V15.131l-2,2L21.081,34.022l-6.25,1.148L15.979,28.92z" fill="currentColor" />
  <path d="M40.908,5.196l3.897,3.897L20.822,33.076l-4.843,0.946l0.946-4.844L40.908,5.196 M40.908,2.368l-1.414,1.414L15.511,27.765l-0.432,0.431l-0.117,0.599l-0.946,4.844l-0.57,2.916l2.916-0.57l4.844-0.947l0.599-0.117l0.432-0.432l23.982-23.982l1.414-1.414l-1.414-1.414l-3.897-3.897L40.908,2.368L40.908,2.368z" fill="currentColor" />
  <path fill="none" stroke="currentColor" strokeWidth="2" d="M45.512 9.789c-.004.003 1.39-1.391 1.39-1.391 1.464-1.464 1.464-3.837.002-5.3-1.466-1.464-3.838-1.463-5.301 0 0 0-1.395 1.395-1.391 1.391M17.285 28.148L21.9 32.762" />
</svg></div></Glypher>);};