import { SLIDE_HEIGHT, SLIDE_WIDTH } from '../schema/defaults';
import type { SlideDoc } from '../schema/types';

const createId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

export function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/<iframe\b[^>]*>/gi, (tag) => tag.replace(/\s+srcdoc\s*=\s*("[^"]*"|'[^']*')/gi, ''));
}

export function importHtmlAsSandbox(html: string): SlideDoc {
  return {
    id: createId('slide'),
    name: 'Imported HTML',
    width: SLIDE_WIDTH,
    height: SLIDE_HEIGHT,
    background: { type: 'solid', color: '#ffffff' },
    elements: [{ id: createId('html'), type: 'html', x: 0, y: 0, width: SLIDE_WIDTH, height: SLIDE_HEIGHT, zIndex: 0, html: sanitizeHtml(html), editableLevel: 'none', sandbox: true }],
  };
}
