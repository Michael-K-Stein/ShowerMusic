import "./glyphs.css"
import Glypher from "./glypher"
export default function RewindGlyph({glyphTitle} : {glyphTitle: string}){return(<Glypher glyphTitle={glyphTitle}><div className="svg-glyph"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" className="min-h-full min-w-full max-h-full max-w-full w-full h-full"><rect fill="transparent" width="100%" height="100%" />
  <path d="M26,21.85V8.154L0.169,25L26,41.846V28.149l21,13.696V8.154L26,21.85z" fill="#FFFFFF" />
</svg></div></Glypher>);};