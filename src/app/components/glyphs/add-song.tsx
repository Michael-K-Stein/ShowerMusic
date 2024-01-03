import "./glyphs.css"
import Glypher from "./glypher"
export default function AddSongGlyph({glyphTitle} : {glyphTitle: string}){return(<Glypher glyphTitle={glyphTitle}><div className="svg-glyph"><svg xmlns="http://www.w3.org/2000/svg" className="min-h-full min-w-full max-h-full max-w-full w-full h-full" viewBox="0 0 50 50"><rect fill="transparent" width="100%" height="100%" />
  <g data-name="Add song">
    <circle cx="40" cy="40" r="9" fill="none" stroke="#FFFFFF" stroke-linecap="round" strokeWidth="2" />
    <line x1="40" x2="40" y1="45" y2="35" fill="none" stroke="#FFFFFF" strokeWidth="2" />
    <line x1="35" x2="45" y1="40" y2="40" fill="none" stroke="#FFFFFF" strokeWidth="2" />
    <path d="M36,4.01V28.69a12,12,0,0,0-7.95,10.28H27a5.023,5.023,0,0,1-4.98-5.52,5.156,5.156,0,0,1,5.19-4.54H30a2.008,2.008,0,0,0,2-2.01V13.72a1,1,0,0,0-1.21-.99l-13,3.28A1.008,1.008,0,0,0,17,17V37.96A6.02,6.02,0,0,1,11,44H8a5.023,5.023,0,0,1-4.98-5.52,5.156,5.156,0,0,1,5.19-4.54H11a2.008,2.008,0,0,0,2-2.01V9.41a2.015,2.015,0,0,1,1.57-1.97L34.79,3.02A1,1,0,0,1,36,4.01Z" fill="#FFFFFF" />
    <circle cx="40" cy="40" r="9" fill="none" stroke="#FFFFFF" stroke-linecap="round" strokeWidth="2" />
  </g>
</svg></div></Glypher>);};