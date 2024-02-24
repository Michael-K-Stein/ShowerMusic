import "./glyphs.css"
import { Tooltip, TooltipProps } from "@mui/material";
import Glypher from "./glypher"
export default function EraseGlyph({glyphTitle, placement, ...props} : {glyphTitle: string, placement?: TooltipProps[ "placement" ]} & React.HTMLAttributes<HTMLDivElement>){return(<Glypher glyphTitle={glyphTitle} placement={placement} { ...props }><div className="svg-glyph erase-glyph"><svg xmlns="http://www.w3.org/2000/svg" className="min-h-full min-w-full max-h-full max-w-full w-full h-full" viewBox="0 0 50 50"><rect fill="transparent" stroke="none" width="100%" height="100%" />
  <path d="M47.129,17.39L34.75,4.884c-1.143-1.153-3.14-1.153-4.28,0L3.869,31.754c-1.17,1.183-1.17,3.108,0.001,4.294l9.567,9.663c0.19,0.191,0.449,0.3,0.718,0.3h8.471c0.27,0,0.528-0.108,0.718-0.3l11.15-11.263l0,0l0,0L47.13,21.685C48.301,20.5,48.301,18.573,47.129,17.39z M22.205,43.989h-7.628l-9.27-9.362c-0.396-0.401-0.396-1.052-0.001-1.451l12.68-12.808l14.323,13.417L22.205,43.989z" fill="currentColor" />
  <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.021" d="M17.331 45L41 45" />
</svg></div></Glypher>);};