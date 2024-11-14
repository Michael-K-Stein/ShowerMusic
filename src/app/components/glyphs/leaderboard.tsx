import "./glyphs.css"
import { Tooltip, TooltipProps } from "@mui/material";
import Glypher from "./glypher"
export default function LeaderboardGlyph({glyphTitle, placement, ...props} : {glyphTitle: string, placement?: TooltipProps[ "placement" ]} & React.HTMLAttributes<HTMLDivElement>){return(<Glypher glyphTitle={glyphTitle} placement={placement} { ...props }><div className="svg-glyph leaderboard-glyph"><svg xmlns="http://www.w3.org/2000/svg" className="min-h-full min-w-full max-h-full max-w-full w-full h-full" viewBox="0 0 50 50"><rect fill="transparent" stroke="none" width="100%" height="100%" />
  <path d="M47,22H34V12c0-1.654-1.346-3-3-3H19c-1.654,0-3,1.346-3,3v6H3c-1.654,0-3,1.346-3,3v18.8c0,0.553,0.448,1,1,1h48c0.553,0,1-0.447,1-1V25C50,23.346,48.654,22,47,22z M12,31H7c0-0.4,0-0.7,0.1-1s0.2-0.6,0.3-0.9c0.1-0.3,0.3-0.6,0.6-0.8c0.2-0.3,0.5-0.5,0.8-0.8l0.7-0.6c0.2-0.2,0.3-0.301,0.4-0.4s0.2-0.3,0.3-0.4c0.1-0.1,0.1-0.3,0.1-0.399c0-0.2,0-0.3,0-0.6c0-0.7-0.3-1-0.8-1c-0.2,0-0.4,0-0.5,0.1c-0.1,0.1-0.2,0.2-0.3,0.3c-0.1,0.1-0.1,0.3-0.1,0.5s0,0.4,0,0.6H7v-0.3c0-0.8,0.2-1.3,0.6-1.7s1-0.6,1.9-0.6c0.8,0,1.4,0.2,1.8,0.6c0.4,0.4,0.6,0.9,0.6,1.6c0,0.3,0,0.5-0.1,0.7c0,0.199-0.1,0.399-0.2,0.6s-0.2,0.4-0.4,0.6c-0.2,0.2-0.4,0.4-0.6,0.601L9.7,28.6C9.5,28.8,9.3,29,9.1,29.2C9.1,29.4,9,29.6,9,29.7h3V31z M26,22h-1.6v-5.6h-1.6v-1.1h0.1c0.5,0,1-0.1,1.3-0.3c0.3-0.2,0.5-0.5,0.6-1H26V22z M43,33.6c-0.1,0.301-0.2,0.5-0.4,0.801C42.4,34.6,42.1,34.8,41.8,35c-0.3,0.1-0.8,0.2-1.3,0.2c-0.8,0-1.4-0.2-1.7-0.601c-0.399-0.399-0.6-1-0.6-1.8h1.6c-0.2,0.3-0.1,0.601,0,0.9c0.101,0.2,0.4,0.399,0.7,0.399c0.2,0,0.4,0,0.5-0.1s0.2-0.2,0.3-0.3C41.4,33.6,41.4,33.4,41.4,33.3c0-0.2,0-0.3,0-0.5s0-0.399,0-0.5c0-0.2-0.101-0.3-0.2-0.399C41.1,31.8,41,31.7,40.9,31.6c-0.101-0.1-0.301-0.1-0.5-0.1h-0.5v-1.1h0.5c0.199,0,0.3,0,0.399-0.101c0.101-0.1,0.2-0.2,0.3-0.3c0.101-0.1,0.101-0.2,0.2-0.4c0-0.199,0.101-0.3,0.101-0.5c0-0.399-0.101-0.699-0.2-0.8c-0.101-0.2-0.3-0.2-0.601-0.2c-0.199,0-0.3,0-0.399,0.101c-0.101,0.1-0.2,0.2-0.3,0.3C39.8,28.6,39.8,28.8,39.8,28.9c0,0.199,0,0.3,0,0.5h-1.5c0-0.801,0.2-1.4,0.601-1.801C39.3,27.2,39.9,27,40.6,27c0.7,0,1.301,0.2,1.7,0.5c0.4,0.3,0.601,0.8,0.601,1.6c0,0.5-0.101,0.9-0.301,1.2C42.4,30.6,42.1,30.8,41.7,30.9c0.5,0.1,0.899,0.3,1.1,0.6s0.3,0.8,0.3,1.3C43.1,33.1,43.1,33.3,43,33.6z" fill="currentColor" />
</svg></div></Glypher>);};