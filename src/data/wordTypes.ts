import type { VocabWord, WordType } from '../types';
import { ACCENTS, Accent } from '../components/ChoiceGrid';

/** Decks for Flashcards and Typing Dojo, one per word type (tags from JMdict). */
export const WORD_TYPES: Array<{ id: WordType; glyph: string; accent: Accent }> = [
  { id: 'noun', glyph: '名', accent: ACCENTS.sky },
  { id: 'verb', glyph: '動', accent: ACCENTS.rose },
  { id: 'i-adj', glyph: 'い', accent: ACCENTS.amber },
  { id: 'na-adj', glyph: 'な', accent: ACCENTS.emerald },
  { id: 'adverb', glyph: '副', accent: ACCENTS.purple },
  { id: 'phrase', glyph: '句', accent: ACCENTS.pink }
];

export const isWordType = (id: string | null): id is WordType =>
  WORD_TYPES.some(w => w.id === id);

export const wordTypeOf = (w: VocabWord): WordType => w.wordType ?? 'noun';
