import type { DeckDoc, SlideDoc, Theme } from './types';

export const SLIDE_WIDTH = 960;
export const SLIDE_HEIGHT = 540;

const createId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

export const defaultTheme: Theme = {
  id: 'theme-default',
  name: 'Default',
  fonts: { heading: 'Inter, system-ui, sans-serif', body: 'Inter, system-ui, sans-serif' },
  colors: { primary: '#2563eb', secondary: '#7c3aed', background: '#ffffff', text: '#111827' },
};

export function createDefaultSlide(): SlideDoc {
  return {
    id: createId('slide'),
    name: 'Blank Slide',
    width: SLIDE_WIDTH,
    height: SLIDE_HEIGHT,
    background: { type: 'solid', color: '#ffffff' },
    elements: [
      { id: createId('text'), type: 'text', x: 72, y: 72, width: 500, height: 80, zIndex: 2, text: 'HTML Slide Editor', style: { fontSize: 44, fontWeight: 700, color: '#111827', lineHeight: 1.1 } },
      { id: createId('shape'), type: 'shape', shape: 'rect', x: 560, y: 250, width: 260, height: 150, zIndex: 1, style: { fill: '#dbeafe', stroke: '#2563eb', strokeWidth: 3, borderRadius: 18 } },
    ],
  };
}

export function createDefaultDeck(): DeckDoc {
  const now = new Date().toISOString();
  return { id: createId('deck'), title: 'Untitled Deck', version: '0.1.0', theme: defaultTheme, slides: [createDefaultSlide()], assets: [], createdAt: now, updatedAt: now };
}
