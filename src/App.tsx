import { useEffect, useMemo, useState } from 'react';
import { Canvas } from './components/Canvas';
import { createDefaultDeck } from './core/schema/defaults';
import type { DeckDoc, SlideElement, TextElement } from './core/schema/types';
import { importHtmlAsSandboxSlides } from './core/importer/htmlImporter';
import './styles.css';

const createId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;
type TextElementPatch = Omit<Partial<TextElement>, 'style'> & { style?: Partial<TextElement['style']> };
const isEditableTarget = (target: EventTarget | null) => target instanceof HTMLElement && Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));

export default function App() {
  const [deck, setDeck] = useState<DeckDoc>(() => createDefaultDeck());
  const [currentSlideId, setCurrentSlideId] = useState(() => deck.slides[0].id);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [editingTextElementId, setEditingTextElementId] = useState<string | null>(null);

  const currentSlide = useMemo(() => deck.slides.find((slide) => slide.id === currentSlideId) ?? deck.slides[0], [deck.slides, currentSlideId]);
  const selectedElement = currentSlide.elements.find((element) => element.id === selectedElementId);

  const updateDeck = (updater: (deck: DeckDoc) => DeckDoc) => setDeck((previous) => ({ ...updater(previous), updatedAt: new Date().toISOString() }));

  const updateSelectedSlideElement = (id: string, updater: (element: SlideElement) => SlideElement) => updateDeck((previous) => ({
    ...previous,
    slides: previous.slides.map((slide) => slide.id === currentSlide.id ? { ...slide, elements: slide.elements.map((element) => element.id === id ? updater(element) : element) } : slide),
  }));

  const patchElement = (id: string, patch: Partial<SlideElement>) => updateSelectedSlideElement(id, (element) => ({ ...element, ...patch } as SlideElement));
  const patchTextElement = (id: string, patch: TextElementPatch) => updateSelectedSlideElement(id, (element) => element.type === 'text' ? ({ ...element, ...patch, style: { ...element.style, ...patch.style } } as TextElement) : element);

  const moveElement = (id: string, x: number, y: number) => patchElement(id, { x: Math.round(x), y: Math.round(y) });
  const resizeElement = (id: string, width: number, height: number) => patchElement(id, { width, height });

  const addTextElement = () => {
    const nextZIndex = Math.max(0, ...currentSlide.elements.map((element) => element.zIndex)) + 1;
    const textElement: TextElement = {
      id: createId('text'),
      type: 'text',
      x: 120,
      y: 120,
      width: 360,
      height: 80,
      zIndex: nextZIndex,
      text: '双击编辑文本',
      style: { fontSize: 32, fontWeight: 700, color: '#111827', lineHeight: 1.2 },
    };
    updateDeck((previous) => ({ ...previous, slides: previous.slides.map((slide) => slide.id === currentSlide.id ? { ...slide, elements: [...slide.elements, textElement] } : slide) }));
    setSelectedElementId(textElement.id);
    setEditingTextElementId(textElement.id);
  };

  const deleteSelected = () => {
    if (!selectedElementId) return;
    updateDeck((previous) => ({ ...previous, slides: previous.slides.map((slide) => slide.id === currentSlide.id ? { ...slide, elements: slide.elements.filter((element) => element.id !== selectedElementId) } : slide) }));
    setSelectedElementId(null);
    setEditingTextElementId(null);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;
      if (event.key === 'Escape') setEditingTextElementId(null);
      if (event.key === 'Delete' || event.key === 'Backspace') deleteSelected();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const importHtmlFile = async (file: File) => {
    const html = await file.text();
    const importedSlides = importHtmlAsSandboxSlides(html);
    const firstImportedSlide = importedSlides[0];
    updateDeck((previous) => ({ ...previous, slides: [...previous.slides, ...importedSlides] }));
    setCurrentSlideId(firstImportedSlide.id);
    setSelectedElementId(firstImportedSlide.elements[0]?.id ?? null);
    setEditingTextElementId(null);
  };

  const updateNumberField = (key: 'x' | 'y' | 'width' | 'height', value: string) => {
    if (!selectedElement) return;
    const numericValue = Math.round(Number(value));
    if (!Number.isFinite(numericValue)) return;
    patchElement(selectedElement.id, { [key]: key === 'width' || key === 'height' ? Math.max(24, numericValue) : numericValue } as Partial<SlideElement>);
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div><p className="eyebrow">HTML Slide Editor</p><h1>{deck.title}</h1></div>
        <div className="toolbar"><button onClick={addTextElement}>Add Text</button><label className="import-button">Import HTML<input type="file" accept=".html,.htm,text/html" onChange={(event: any) => { const file = event.target.files?.[0]; if (file) void importHtmlFile(file); event.currentTarget.value = ''; }} /></label></div>
      </header>
      <section className="workspace">
        <aside className="sidebar"><h2>Slides</h2>{deck.slides.map((slide, index) => <button key={slide.id} className={slide.id === currentSlide.id ? 'slide-thumb active' : 'slide-thumb'} onClick={() => { setCurrentSlideId(slide.id); setSelectedElementId(null); setEditingTextElementId(null); }}><span>{index + 1}</span>{slide.name}</button>)}</aside>
        <Canvas slide={currentSlide} selectedElementId={selectedElementId} editingTextElementId={editingTextElementId} onSelectElement={(id) => { setSelectedElementId(id); if (id !== editingTextElementId) setEditingTextElementId(null); }} onMoveElement={moveElement} onResizeElement={resizeElement} onStartTextEdit={setEditingTextElementId} onTextChange={(id, text) => patchTextElement(id, { text })} />
        <aside className="inspector"><h2>Inspector</h2>{selectedElement ? <div className="property-panel"><p>Selected: <strong>{selectedElement.type}</strong></p><div className="field-grid">{(['x', 'y', 'width', 'height'] as const).map((key) => <label key={key}>{key}<input type="number" value={selectedElement[key]} onChange={(event: any) => updateNumberField(key, event.target.value)} /></label>)}</div>{selectedElement.type === 'text' && <><label>Text<textarea value={selectedElement.text} onChange={(event: any) => patchTextElement(selectedElement.id, { text: event.target.value })} /></label><div className="field-grid"><label>Font Size<input type="number" min="8" value={selectedElement.style.fontSize} onChange={(event: any) => patchTextElement(selectedElement.id, { style: { fontSize: Math.max(8, Number(event.target.value) || 8) } })} /></label><label>Weight<input type="number" min="100" max="900" step="100" value={selectedElement.style.fontWeight ?? 400} onChange={(event: any) => patchTextElement(selectedElement.id, { style: { fontWeight: Number(event.target.value) || 400 } })} /></label><label>Color<input type="color" value={selectedElement.style.color} onChange={(event: any) => patchTextElement(selectedElement.id, { style: { color: event.target.value } })} /></label></div></>}<button onClick={deleteSelected}>Delete selected</button></div> : <p>No element selected.</p>}<pre>{JSON.stringify(currentSlide, null, 2)}</pre></aside>
      </section>
    </main>
  );
}
