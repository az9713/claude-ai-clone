import CodePreview from './CodePreview.jsx'
import HtmlPreview from './HtmlPreview.jsx'
import SvgPreview from './SvgPreview.jsx'
import MermaidPreview from './MermaidPreview.jsx'

export default function ArtifactViewer({ artifact }) {
  if (!artifact) {
    return (
      <div className="h-full flex items-center justify-center" style={{ color: 'var(--text-tertiary)' }}>
        <span className="text-sm">No artifact selected</span>
      </div>
    )
  }

  switch (artifact.type) {
    case 'html':
      return <HtmlPreview content={artifact.content} />
    case 'svg':
      return <SvgPreview content={artifact.content} />
    case 'mermaid':
      return <MermaidPreview content={artifact.content} />
    case 'code':
    case 'react':
    default:
      return <CodePreview content={artifact.content} language={artifact.language} />
  }
}
