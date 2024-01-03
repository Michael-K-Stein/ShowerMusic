import "./glyphs.css"
import Glypher from "./glypher"
export default function SearchGlyph({glyphTitle} : {glyphTitle: string}){return(<Glypher glyphTitle={glyphTitle}><div className="svg-glyph"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="min-h-full min-w-full max-h-full max-w-full w-full h-full"><rect fill="transparent" width="100%" height="100%" />
  <path fill="none" stroke="#FFFFFF" strokeWidth="2" d="M19 4A9 9 0 1 0 19 22 9 9 0 1 0 19 4zM4 28L13 19" />
</svg></div></Glypher>);};