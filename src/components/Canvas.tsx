import type { CSSProperties, PointerEvent } from 'react';
import type { SlideDoc, SlideElement } from '../core/schema/types';

type CanvasProps = {
  slide: SlideDoc;
  selectedElementId?: string | null;
  editingTextElementId?: string | null;
  onSelectElement: (id: string | null) => void;
  onMoveElement: (id: string, x: number, y: number) => void;
  onResizeElement: (id: string, width: number, height: number) => void;
  onStartTextEdit: (id: string | null) => void;
  onTextChange: (id: string, text: string) => void;
};

function backgroundStyle(slide: SlideDoc): CSSProperties {
  if (slide.background.type === 'solid') return { background: slide.background.color };
  if (slide.background.type === 'gradient') return { background: slide.background.value };
  return { backgroundImage: `url(${slide.background.src})`, backgroundSize: slide.background.objectFit ?? 'cover', backgroundPosition: 'center' };
}

function elementStyle(element: SlideElement, selected: boolean, editing = false): CSSProperties {
  return {
    position: 'absolute',
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    zIndex: element.zIndex,
    transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
    outline: selected ? '2px solid #2563eb' : '1px solid transparent',
    outlineOffset: 2,
    cursor: element.locked ? 'default' : editing ? 'text' : 'move',
    display: element.visible === false ? 'none' : undefined,
    userSelect: editing ? 'text' : 'none',
  };
}

const MIN_ELEMENT_SIZE = 24;

export function Canvas({ slide, selectedElementId, editingTextElementId, onSelectElement, onMoveElement, onResizeElement, onStartTextEdit, onTextChange }: CanvasProps) {
  const sortedElements = [...slide.elements].sort((a, b) => a.zIndex - b.zIndex);

  const startDrag = (event: PointerEvent<HTMLDivElement>, element: SlideElement) => {
    event.stopPropagation();
    onSelectElement(element.id);
    if (element.locked || editingTextElementId === element.id) return;

    const startX = event.clientX;
    const startY = event.clientY;
    const originX = element.x;
    const originY = element.y;
    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);

    const handleMove = (moveEvent: globalThis.PointerEvent) => {
      onMoveElement(element.id, originX + moveEvent.clientX - startX, originY + moveEvent.clientY - startY);
    };
    const handleUp = () => {
      target.removeEventListener('pointermove', handleMove);
      target.removeEventListener('pointerup', handleUp);
      target.removeEventListener('pointercancel', handleUp);
    };

    target.addEventListener('pointermove', handleMove);
    target.addEventListener('pointerup', handleUp);
    target.addEventListener('pointercancel', handleUp);
  };

  const startResize = (event: PointerEvent<HTMLButtonElement>, element: SlideElement) => {
    event.stopPropagation();
    onSelectElement(element.id);
    if (element.locked) return;

    const startX = event.clientX;
    const startY = event.clientY;
    const originWidth = element.width;
    const originHeight = element.height;
    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);

    const handleMove = (moveEvent: globalThis.PointerEvent) => {
      onResizeElement(
        element.id,
        Math.max(MIN_ELEMENT_SIZE, Math.round(originWidth + moveEvent.clientX - startX)),
        Math.max(MIN_ELEMENT_SIZE, Math.round(originHeight + moveEvent.clientY - startY)),
      );
    };
    const handleUp = () => {
      target.removeEventListener('pointermove', handleMove);
      target.removeEventListener('pointerup', handleUp);
      target.removeEventListener('pointercancel', handleUp);
    };

    target.addEventListener('pointermove', handleMove);
    target.addEventListener('pointerup', handleUp);
    target.addEventListener('pointercancel', handleUp);
  };

  return (
    <div className="canvas-shell">
      <div className="slide-canvas" style={{ width: slide.width, height: slide.height, ...backgroundStyle(slide) }} onPointerDown={() => { onSelectElement(null); onStartTextEdit(null); }}>
        {sortedElements.map((element) => {
          const selected = selectedElementId === element.id;
          const editing = editingTextElementId === element.id;
          const resizeHandle = selected && !editing && <button className="resize-handle" aria-label="Resize selected element" onPointerDown={(event: any) => startResize(event, element)} />;
          if (element.type === 'text') {
            return <div key={element.id} className="slide-element text-element" contentEditable={editing} suppressContentEditableWarning style={{ ...elementStyle(element, selected, editing), ...element.style }} onPointerDown={(event: any) => startDrag(event, element)} onDoubleClick={(event: any) => { event.stopPropagation(); onSelectElement(element.id); onStartTextEdit(element.id); }} onInput={(event: any) => onTextChange(element.id, event.currentTarget.textContent ?? '')} onBlur={() => onStartTextEdit(null)}>{element.text}{resizeHandle}</div>;
          }
          if (element.type === 'shape') {
            return <div key={element.id} className="slide-element shape-element" style={{ ...elementStyle(element, selected), background: element.style.fill, border: `${element.style.strokeWidth ?? 0}px solid ${element.style.stroke ?? 'transparent'}`, borderRadius: element.style.borderRadius, opacity: element.style.opacity }} onPointerDown={(event: any) => startDrag(event, element)}>{resizeHandle}</div>;
          }
          return <div key={element.id} className="slide-element html-element" style={elementStyle(element, selected)} onPointerDown={(event: any) => startDrag(event, element)}><iframe title="Imported HTML" sandbox="allow-same-origin" srcDoc={element.html} />{resizeHandle}</div>;
        })}
      </div>
    </div>
  );
}
