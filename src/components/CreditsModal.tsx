import React from 'react';
import { X, ExternalLink } from 'lucide-react';

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Source {
  name: string;
  what: string;
  licence: string;
  licenceUrl: string;
  homeUrl: string;
}

/**
 * Attribution for the open datasets KotobaQuest ships.
 * JMdict/KANJIDIC2 (EDRDG) and KanjiVG both require acknowledgement and a link
 * in the app, and their ShareAlike terms cover the data files in public/data/.
 */
const SOURCES: Source[] = [
  {
    name: 'KANJIDIC2 — Electronic Dictionary Research and Development Group',
    what: 'Kanji meanings, readings and stroke counts.',
    licence: 'CC BY-SA 4.0',
    licenceUrl: 'https://www.edrdg.org/edrdg/licence.html',
    homeUrl: 'https://www.edrdg.org/wiki/index.php/KANJIDIC_Project'
  },
  {
    name: 'KanjiVG — Ulrich Apel',
    what: 'Stroke-order paths behind the writing board.',
    licence: 'CC BY-SA 3.0',
    licenceUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    homeUrl: 'https://kanjivg.tagaini.net'
  },
  {
    name: 'JLPT resources — Jonathan Waller',
    what: 'JLPT N5–N1 vocabulary and kanji levels.',
    licence: 'CC BY',
    licenceUrl: 'https://creativecommons.org/licenses/by/4.0/',
    homeUrl: 'https://www.tanos.co.uk/jlpt/'
  },
  {
    name: 'Unsplash',
    what: 'Photographs used as picture clues in Wordle.',
    licence: 'Unsplash License',
    licenceUrl: 'https://unsplash.com/license',
    homeUrl: 'https://unsplash.com'
  }
];

export const CreditsModal: React.FC<CreditsModalProps> = ({ isOpen, onClose }) => {
  React.useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Data sources and licences"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative max-h-[85vh] flex flex-col"
      >
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">Data sources &amp; licences</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              KotobaQuest is built on open Japanese-language data.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto py-4 space-y-4">
          {SOURCES.map(s => (
            <div key={s.name} className="text-xs">
              <a
                href={s.homeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-white hover:text-rose-300 inline-flex items-center gap-1"
              >
                {s.name}
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
              <p className="text-slate-400 mt-0.5">{s.what}</p>
              <a
                href={s.licenceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline"
              >
                {s.licence}
              </a>
            </div>
          ))}

          <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 space-y-2">
            <p>
              The generated data files this app serves from <code className="text-slate-300">/data/</code> are
              adaptations of the sources above and are shared under{' '}
              <a
                href="https://creativecommons.org/licenses/by-sa/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline"
              >
                CC BY-SA 4.0
              </a>
              .
            </p>
            <p>
              JLPT levels are unofficial estimates. The organisers stopped publishing official word lists
              after the 2010 revision.
            </p>
            <p>
              Nepali translations and example sentences are written by hand for KotobaQuest and cover the
              curated entries only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
