import { useEffect, useMemo, useState } from 'react';
import { Canvas } from './components/Canvas';
import { createDefaultDeck } from './core/schema/defaults';
import type { DeckDoc } from './core/schema/types';
import { importHtmlAsSandboxSlides } from './core/importer/htmlImporter';
import './styles.css';

export default function App() {
  const [deck, setDeck] = useState<DeckDoc>(() => createDefaultDeck());
  const [currentSlideId, setCurrentSlideId] = useState(() => deck.slides[0].id);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  const currentSlide = useMemo(() => deck.slides.find((slide) => slide.id === currentSlideId) ?? deck.slides[0], [deck.slides, currentSlideId]);
  const selectedElement = currentSlide.elements.find((element) => element.id === selectedElementId);

  const updateDeck = (updater: (deck: DeckDoc) => DeckDoc) => setDeck((previous) => ({ ...updater(previous), updatedAt: new Date().toISOString() }));

  const moveElement = (id: string, x: number, y: number) => updateDeck((previous) => ({ ...previous, slides: previous.slides.map((slide) => slide.id === currentSlide.id ? { ...slide, elements: slide.elements.map((element) => element.id === id ? { ...element, x: Math.round(x), y: Math.round(y) } : element) } : slide) }));

  const resizeElement = (id: string, width: number, height: number) => updateDeck((previous) => ({ ...previous, slides: previous.slides.map((slide) => slide.id === currentSlide.id ? { ...slide, elements: slide.elements.map((element) => element.id === id ? { ...element, width, height } : element) } : slide) }));

  const deleteSelected = () => {
    if (!selectedElementId) return;
    updateDeck((previous) => ({ ...previous, slides: previous.slides.map((slide) => slide.id === currentSlide.id ? { ...slide, elements: slide.elements.filter((element) => element.id !== selectedElementId) } : slide) }));
    setSelectedElementId(null);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
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
  };

  return (
    <main className="app-shell">
      <header className="topbar"><div><p className="eyebrow">HTML Slide Editor</p><h1>{deck.title}</h1></div><label className="import-button">Import HTML<input type="file" accept=".html,.htm,text/html" onChange={(event: any) => { const file = event.target.files?.[0]; if (file) void importHtmlFile(file); event.currentTarget.value = ''; }} /></label></header>
      <section className="workspace">
        <aside className="sidebar"><h2>Slides</h2>{deck.slides.map((slide, index) => <button key={slide.id} className={slide.id === currentSlide.id ? 'slide-thumb active' : 'slide-thumb'} onClick={() => { setCurrentSlideId(slide.id); setSelectedElementId(null); }}><span>{index + 1}</span>{slide.name}</button>)}</aside>
        <Canvas slide={currentSlide} selectedElementId={selectedElementId} onSelectElement={setSelectedElementId} onMoveElement={moveElement} onResizeElement={resizeElement} />
        <aside className="inspector"><h2>State</h2>{selectedElement ? <p>Selected: <strong>{selectedElement.type}</strong><br />x: {selectedElement.x}, y: {selectedElement.y}<br />width: {selectedElement.width}, height: {selectedElement.height}</p> : <p>No element selected.</p>}<button onClick={deleteSelected} disabled={!selectedElement}>Delete selected</button><pre>{JSON.stringify(currentSlide, null, 2)}</pre></aside>
      </section>
    </main>
  );
}
