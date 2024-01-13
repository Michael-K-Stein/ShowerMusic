import "./glyphs.css"
import Glypher from "./glypher"
export default function RemoveGlyph({glyphTitle} : {glyphTitle: string}){return(<Glypher glyphTitle={glyphTitle}><div className="svg-glyph"><svg xmlns="http://www.w3.org/2000/svg" className="min-h-full min-w-full max-h-full max-w-full w-full h-full" viewBox="0 0 50 50"><rect fill="transparent" width="100%" height="100%" />
  <path fill="none" stroke="#FFFFFF" strokeWidth="4" d="M13.7 13.7L36.4 36.3M36.4 13.7L13.7 36.3" />
</svg></div></Glypher>);};