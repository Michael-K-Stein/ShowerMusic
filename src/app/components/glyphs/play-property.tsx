import "./glyphs.css"
import { Tooltip, TooltipProps } from "@mui/material";
import Glypher from "./glypher"
export default function PlayPropertyGlyph({glyphTitle, placement, ...props} : {glyphTitle: string, placement?: TooltipProps[ "placement" ]} & React.HTMLAttributes<HTMLDivElement>){return(<Glypher glyphTitle={glyphTitle} placement={placement} { ...props }><div className="svg-glyph play-property-glyph"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" className="min-h-full min-w-full max-h-full max-w-full w-full h-full"><rect fill="transparent" stroke="none" width="100%" height="100%" />
  <path d="M44,37.8l-8.8-4.4c-0.4-0.2-2.5-1.6-2.5,0.5V41H1c-0.6,0-1-0.4-1-1V9h44V37.8z M41.2,0C42.7,0,44,1.3,44,2.8V7H0V2.8C0,1.3,1.3,0,2.8,0H41.2z M14,17h23v-2H14V17z M14,22h23v-2H14V22z M14,27h23v-2H14V27z M14,32h16v-2H14V32z M7,32h4v-2H7V32z M7,17h4v-2H7V17z M7,27h4v-2H7V27z M7,22h4v-2H7V22z" fill="currentColor" />
  <path d="M33.9,50c-1,0-1.9-0.9-1.9-1.9V33.9c0-1,0.8-1.9,1.9-1.9c0.1,0,0.3,0,0.4,0.1l14.1,7c0.4,0.2,1.6,0.8,1.6,1.9c0,1.1-1.2,1.7-1.6,1.9l-14.1,7C34.2,50,34,50,33.9,50z M34,34.2v13.7l13.6-6.7c0.1,0,0.1-0.1,0.2-0.1c-0.1,0-0.1-0.1-0.2-0.1L34,34.2z" fill="currentColor" />
</svg></div></Glypher>);};