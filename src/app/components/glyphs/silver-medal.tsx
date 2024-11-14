import "./glyphs.css"
import { Tooltip, TooltipProps } from "@mui/material";
import Glypher from "./glypher"
export default function SilverMedalGlyph({glyphTitle, placement, ...props} : {glyphTitle: string, placement?: TooltipProps[ "placement" ]} & React.HTMLAttributes<HTMLDivElement>){return(<Glypher glyphTitle={glyphTitle} placement={placement} { ...props }><div className="svg-glyph silver-medal-glyph"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" className="min-h-full min-w-full max-h-full max-w-full w-full h-full"><rect fill="transparent" stroke="none" width="100%" height="100%" />
  <path d="M25,17c-8.822,0-16,7.178-16,16s7.178,16,16,16s16-7.178,16-16S33.822,17,25,17z M25,45c-6.617,0-12-5.383-12-12s5.383-12,12-12c6.617,0,12,5.383,12,12S31.617,45,25,45z" fill="currentColor" />
  <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M31 14.7L31 19.245M19 19.245V15c0-1.105.895-2 2-2h.2" />
  <path d="M30 16H20c-.358 0-.689-.191-.867-.502s-.177-.692.003-1.002l7-12C26.315 2.189 26.645 2 27 2h10c.358 0 .688.191.867.502s.177.692-.003 1.002l-7 12C30.685 15.811 30.355 16 30 16zM19.249 10.333l4.59-7.869C23.656 2.178 23.342 2 23 2H13c-.358 0-.689.191-.867.502s-.177.693.003 1.002l4.928 8.449C17.627 11.228 18.376 10.662 19.249 10.333zM25 23c-5.514 0-10 4.486-10 10s4.486 10 10 10c5.514 0 10-4.486 10-10S30.514 23 25 23zM30 30h-2v6h2v2H20v-2h2v-6h-2v-2h10V30z" fill="currentColor" />
  <path d="M24 30H26V36H24z" fill="currentColor" />
</svg></div></Glypher>);};