import "./glyphs.css"
import Glypher from "./glypher"
export default function PauseGlyph({glyphTitle} : {glyphTitle: string}){return(<Glypher glyphTitle={glyphTitle}><div className="svg-glyph"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" className="min-h-full min-w-full max-h-full max-w-full w-full h-full"><rect fill="transparent" width="100%" height="100%" />
  <path d="M12 42h10V8H12V42zM28 8v34h10V8H28z" fill="currentColor" />
</svg></div></Glypher>);};