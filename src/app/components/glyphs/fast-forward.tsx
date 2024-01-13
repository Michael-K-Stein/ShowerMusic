import "./glyphs.css"
import Glypher from "./glypher"
export default function FastForwardGlyph({glyphTitle} : {glyphTitle: string}){return(<Glypher glyphTitle={glyphTitle}><div className="svg-glyph"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" className="min-h-full min-w-full max-h-full max-w-full w-full h-full"><rect fill="transparent" width="100%" height="100%" />
  <path d="M49.831,25L24,8.154V21.85L3,8.154v33.692l21-13.696v13.696L49.831,25z" fill="currentColor" />
</svg></div></Glypher>);};