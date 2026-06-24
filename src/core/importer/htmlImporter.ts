import { SLIDE_HEIGHT, SLIDE_WIDTH } from '../schema/defaults';
import type { SlideDoc } from '../schema/types';

const createId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;
const DEFAULT_IMPORT_WIDTH = SLIDE_WIDTH;
const DEFAULT_IMPORT_HEIGHT = SLIDE_HEIGHT;

type ImportedHtmlParts = {
  head: string;
  body: string;
  width: number;
  height: number;
};

export function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/<iframe\b[^>]*>/gi, (tag) => tag.replace(/\s+srcdoc\s*=\s*("[^"]*"|'[^']*')/gi, ''));
}

function extractTagContent(html: string, tagName: 'head' | 'body'): string | null {
  const match = html.match(new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i'));
  return match?.[1] ?? null;
}

function stripOuterDocumentTags(html: string): string {
  return html
    .replace(/<!doctype[^>]*>/gi, '')
    .replace(/<\/?html\b[^>]*>/gi, '')
    .replace(/<\/?head\b[^>]*>/gi, '')
    .replace(/<\/?body\b[^>]*>/gi, '')
    .trim();
}

function readCssSize(value: string | undefined): number | null {
  if (!value) return null;
  const match = value.match(/([0-9]+(?:\.[0-9]+)?)\s*(px|pt)?/i);
  if (!match) return null;
  const numericValue = Number(match[1]);
  if (!Number.isFinite(numericValue) || numericValue <= 0) return null;
  return match[2]?.toLowerCase() === 'pt' ? Math.round(numericValue * (4 / 3)) : Math.round(numericValue);
}

function detectImportSize(html: string): { width: number; height: number } {
  const widthCandidates = [
    html.match(/w-\[([0-9.]+(?:px|pt)?)\]/i)?.[1],
    html.match(/(?:^|[;\s])width\s*:\s*([^;"']+)/i)?.[1],
    html.match(/\bwidth\s*=\s*["']?([0-9.]+(?:px|pt)?)/i)?.[1],
    html.match(/--(?:slide|page|deck|canvas)-width\s*:\s*([^;"']+)/i)?.[1],
  ];
  const heightCandidates = [
    html.match(/h-\[([0-9.]+(?:px|pt)?)\]/i)?.[1],
    html.match(/(?:^|[;\s])height\s*:\s*([^;"']+)/i)?.[1],
    html.match(/\bheight\s*=\s*["']?([0-9.]+(?:px|pt)?)/i)?.[1],
    html.match(/--(?:slide|page|deck|canvas)-height\s*:\s*([^;"']+)/i)?.[1],
  ];

  return {
    width: widthCandidates.map(readCssSize).find((size): size is number => Boolean(size)) ?? DEFAULT_IMPORT_WIDTH,
    height: heightCandidates.map(readCssSize).find((size): size is number => Boolean(size)) ?? DEFAULT_IMPORT_HEIGHT,
  };
}


function createCompatibilityCss(): string {
  return `
  .ppt-slide { position: relative; width: 1280px; height: 720px; margin: 0 auto; padding: 40px; box-sizing: border-box; overflow: hidden; }
  .font-heading { font-family: 'Chiron Hei HK', 'Quattrocento Sans', 'Noto Sans SC', sans-serif; }
  [class~="absolute"] { position: absolute; } [class~="relative"] { position: relative; } [class~="inline-block"] { display: inline-block; }
  [class~="flex"] { display: flex; } [class~="grid"] { display: grid; } [class~="hidden"] { display: none; }
  [class~="inset-0"] { inset: 0; } [class~="z-10"] { z-index: 10; } [class~="h-full"] { height: 100%; } [class~="flex-1"] { flex: 1 1 0%; }
  [class~="flex-col"] { flex-direction: column; } [class~="items-center"] { align-items: center; } [class~="items-start"] { align-items: flex-start; } [class~="justify-center"] { justify-content: center; } [class~="justify-between"] { justify-content: space-between; }
  [class~="shrink-0"] { flex-shrink: 0; } [class~="text-center"] { text-align: center; } [class~="overflow-hidden"] { overflow: hidden; } [class~="box-border"] { box-sizing: border-box; }
  [class~="grid-cols-2"] { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  [class~="gap-3"] { gap: 12px; } [class~="gap-5"] { gap: 20px; } [class~="gap-6"] { gap: 24px; } [class~="gap-8"] { gap: 32px; } [class~="gap-12"], [class~="gap-x-12"] { column-gap: 48px; } [class~="gap-y-6"] { row-gap: 24px; }
  [class~="space-y-3"] > * + * { margin-top: 12px; } [class~="space-y-5"] > * + * { margin-top: 20px; }
  [class~="p-3"] { padding: 12px; } [class~="p-5"] { padding: 20px; } [class~="px-4"] { padding-left: 16px; padding-right: 16px; } [class~="px-5"] { padding-left: 20px; padding-right: 20px; } [class~="py-2"] { padding-top: 8px; padding-bottom: 8px; } [class~="py-8"] { padding-top: 32px; padding-bottom: 32px; }
  [class~="pl-12"] { padding-left: 48px; } [class~="pt-1"] { padding-top: 4px; } [class~="pt-6"] { padding-top: 24px; }
  [class~="mb-1"] { margin-bottom: 4px; } [class~="mb-2"] { margin-bottom: 8px; } [class~="mb-3"] { margin-bottom: 12px; } [class~="mb-4"] { margin-bottom: 16px; } [class~="mb-6"] { margin-bottom: 24px; } [class~="mb-8"] { margin-bottom: 32px; } [class~="mb-10"] { margin-bottom: 40px; } [class~="mb-[40px]"] { margin-bottom: 40px; }
  [class~="mt-2"] { margin-top: 8px; } [class~="mt-8"] { margin-top: 32px; } [class~="mt-12"] { margin-top: 48px; } [class~="mt-16"] { margin-top: 64px; } [class~="mx-auto"] { margin-left: auto; margin-right: auto; }
  [class~="w-2"] { width: 8px; } [class~="h-2"] { height: 8px; } [class~="w-10"] { width: 40px; } [class~="h-10"] { height: 40px; } [class~="w-16"] { width: 64px; } [class~="h-16"] { height: 64px; } [class~="w-20"] { width: 80px; } [class~="h-1"] { height: 4px; } [class~="w-px"] { width: 1px; } [class~="h-6"] { height: 24px; } [class~="w-fit"] { width: fit-content; } [class~="w-[45%]"] { width: 45%; } [class~="w-[1280px]"] { width: 1280px; } [class~="h-[720px]"] { height: 720px; }
  [class~="max-w-2xl"] { max-width: 672px; } [class~="max-w-3xl"] { max-width: 768px; } [class~="max-w-5xl"] { max-width: 1024px; }
  [class~="rounded"] { border-radius: 4px; } [class~="rounded-lg"] { border-radius: 8px; } [class~="rounded-full"] { border-radius: 9999px; }
  [class~="border"] { border-width: 1px; border-style: solid; } [class~="border-t"] { border-top-width: 1px; border-top-style: solid; }
  [class~="font-semibold"] { font-weight: 600; } [class~="font-bold"] { font-weight: 700; }
  [class~="text-sm"] { font-size: 14px; } [class~="text-base"] { font-size: 16px; } [class~="text-lg"] { font-size: 18px; } [class~="text-xl"] { font-size: 20px; } [class~="text-2xl"] { font-size: 24px; } [class~="text-3xl"] { font-size: 30px; } [class~="text-4xl"] { font-size: 36px; } [class~="text-5xl"] { font-size: 48px; } [class~="text-7xl"] { font-size: 72px; }
  [class~="leading-tight"] { line-height: 1.25; } [class~="leading-relaxed"] { line-height: 1.625; } [class~="tracking-widest"] { letter-spacing: .1em; } [class~="tracking-[0.2em]"] { letter-spacing: .2em; } [class~="tracking-[0.3em]"] { letter-spacing: .3em; }
  [class~="opacity-5"] { opacity: .05; } [class~="opacity-10"] { opacity: .1; }
  [class~="bg-gray-50"] { background: #f9fafb; } [class~="bg-[#1A1D21]"], [class~="!bg-[#1A1D21]"] { background-color: #1A1D21 !important; } [class~="bg-[#C0A062]"] { background-color: #C0A062; } [class~="bg-[#C0A062]/20"] { background-color: rgb(192 160 98 / .2); } [class~="bg-[#C0A062]/30"] { background-color: rgb(192 160 98 / .3); } [class~="bg-[#4A5C6A]/20"] { background-color: rgb(74 92 106 / .2); } [class~="bg-[#1A1D21]/50"] { background-color: rgb(26 29 33 / .5); }
  [class~="text-[#E6E9F0]"] { color: #E6E9F0; } [class~="text-[#C0A062]"] { color: #C0A062; } [class~="text-[#8D99AE]"] { color: #8D99AE; }
  [class~="border-[#C0A062]/50"] { border-color: rgb(192 160 98 / .5); } [class~="border-[#8D99AE]/20"] { border-color: rgb(141 153 174 / .2); } [class~="bg-[#8D99AE]/30"] { background-color: rgb(141 153 174 / .3); }
  [class~="bg-gradient-to-br"] { background-image: linear-gradient(to bottom right, var(--tw-gradient-from, transparent), var(--tw-gradient-via, transparent), var(--tw-gradient-to, transparent)); } [class~="from-[#1A1D21]"] { --tw-gradient-from: #1A1D21; } [class~="via-[#2A2D35]"] { --tw-gradient-via: #2A2D35; } [class~="to-[#1A1D21]"] { --tw-gradient-to: #1A1D21; }
  `;
}

function splitImportedHtml(html: string): ImportedHtmlParts {
  const sanitizedHtml = sanitizeHtml(html);
  const head = extractTagContent(sanitizedHtml, 'head') ?? '';
  const body = extractTagContent(sanitizedHtml, 'body') ?? stripOuterDocumentTags(sanitizedHtml);
  const detectedSize = detectImportSize(sanitizedHtml);

  return { head, body, ...detectedSize };
}

export function createFittedHtmlDocument(html: string, viewportWidth = SLIDE_WIDTH, viewportHeight = SLIDE_HEIGHT): string {
  const { head, body, width, height } = splitImportedHtml(html);
  const scale = Math.min(viewportWidth / width, viewportHeight / height);
  const offsetX = Math.max(0, (viewportWidth - width * scale) / 2);
  const offsetY = Math.max(0, (viewportHeight - height * scale) / 2);

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=${viewportWidth}, height=${viewportHeight}, initial-scale=1" />
<style>
  html, body { margin: 0; width: ${viewportWidth}px; height: ${viewportHeight}px; overflow: hidden; background: transparent; }
  *, *::before, *::after { box-sizing: border-box; }
  img, svg, video, canvas { max-width: 100%; }
  #html-slide-editor-fit-root { position: relative; width: ${viewportWidth}px; height: ${viewportHeight}px; overflow: hidden; background: transparent; }
  #html-slide-editor-fit-content { position: absolute; left: ${offsetX}px; top: ${offsetY}px; width: ${width}px; height: ${height}px; transform: scale(${scale}); transform-origin: top left; overflow: hidden; }
</style>
${head}
<style>${createCompatibilityCss()}</style>
</head>
<body>
  <div id="html-slide-editor-fit-root">
    <div id="html-slide-editor-fit-content">${body}</div>
  </div>
</body>
</html>`;
}

function createImportedSlide(html: string, name = 'Imported HTML'): SlideDoc {
  return {
    id: createId('slide'),
    name,
    width: SLIDE_WIDTH,
    height: SLIDE_HEIGHT,
    background: { type: 'solid', color: '#ffffff' },
    elements: [{ id: createId('html'), type: 'html', x: 0, y: 0, width: SLIDE_WIDTH, height: SLIDE_HEIGHT, zIndex: 0, html: createFittedHtmlDocument(html), editableLevel: 'none', sandbox: true }],
  };
}

function extractPptSlideDocuments(html: string): string[] {
  if (typeof DOMParser === 'undefined') return [];

  const sanitizedHtml = sanitizeHtml(html);
  const document = new DOMParser().parseFromString(sanitizedHtml, 'text/html');
  const head = document.head.innerHTML;
  const slideElements = Array.from(document.querySelectorAll('.ppt-slide'));

  return slideElements.map((slideElement) => `<!doctype html><html><head>${head}</head><body>${slideElement.outerHTML}</body></html>`);
}

export function importHtmlAsSandboxSlides(html: string): SlideDoc[] {
  const slideDocuments = extractPptSlideDocuments(html);
  if (slideDocuments.length === 0) return [createImportedSlide(html)];

  return slideDocuments.map((slideHtml, index) => createImportedSlide(slideHtml, `Imported HTML ${index + 1}`));
}

export function importHtmlAsSandbox(html: string): SlideDoc {
  return importHtmlAsSandboxSlides(html)[0];
}
