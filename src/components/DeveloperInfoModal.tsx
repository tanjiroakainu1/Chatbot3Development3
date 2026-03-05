import { DEVELOPER_INFO } from '../data/developerInfo'

interface DeveloperInfoModalProps {
  onClose: () => void
}

function LinkList({ urls }: { urls: string[] }) {
  return (
    <ul className="space-y-1">
      {urls.map((url) => (
        <li key={url}>
          <a
            href={url.startsWith('http') ? url : `https://${url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 hover:underline break-all"
          >
            {url.replace(/^https?:\/\//, '')}
          </a>
        </li>
      ))}
    </ul>
  )
}

export function DeveloperInfoModal({ onClose }: DeveloperInfoModalProps) {
  const d = DEVELOPER_INFO
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 safe-top safe-bottom"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Developer info – 2026 Comms"
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-[calc(100vw-1.5rem)] max-w-2xl max-h-[90vh] max-h-[90dvh] overflow-hidden flex flex-col min-w-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between shrink-0 border-b border-slate-700 px-3 sm:px-4 py-3 min-w-0">
          <h2 className="text-base sm:text-lg font-semibold text-white truncate min-w-0">{d.title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-800"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto overflow-x-hidden flex-1 p-3 sm:p-4 space-y-4 text-sm chat-scroll scrollbar-dark min-w-0">
          <p className="text-indigo-300 font-medium">{d.tagline}</p>
          <p className="text-slate-400 text-xs">Developer: Raminder Jangao</p>

          <div>
            <p className="text-slate-400 font-medium mb-1">Status</p>
            <ul className="text-slate-300 space-y-0.5">
              {d.status.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-slate-400 font-medium mb-1">{d.programmingHeading}</p>
            <ul className="text-slate-300 space-y-0.5">
              {d.techLines.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>

          <p className="text-slate-300">{d.offer}</p>
          <ul className="text-slate-300 space-y-0.5">
            {d.cta.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>

          <div>
            <p className="text-slate-400 font-medium mb-2">Projects & demos</p>
            <LinkList urls={d.projectUrls} />
          </div>

          <div>
            <p className="text-slate-400 font-medium mb-2">{d.section3D}</p>
            <LinkList urls={d.projectUrls3D} />
          </div>

          <div>
            <p className="text-slate-400 font-medium mb-2">More links</p>
            <LinkList urls={d.projectUrlsMore} />
          </div>

          <div>
            <p className="text-slate-400 font-medium mb-2">{d.fbAccountsLabel}</p>
            <ul className="space-y-1">
              {d.socialUrls.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 hover:underline break-all"
                  >
                    {s.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-slate-400 font-medium mb-2">Drive</p>
            <ul className="space-y-1">
              {d.driveUrls.map((url, i) => (
                <li key={i}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 hover:underline break-all"
                  >
                    Drive link {i + 1}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
