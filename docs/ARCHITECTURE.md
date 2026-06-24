# Architecture

## Architectural Direction

The system should be built around a structured slide document model, not arbitrary HTML strings.

Old demo-style approach:

```text
htmlContent string -> preview -> export
```

Target architecture:

```text
DeckDoc / SlideDoc JSON
  -> React editor renderer
  -> user edits JSON state
  -> static HTML exporter
```

## Core Modules

```text
src/
  core/
    schema/
      deck.ts
      slide.ts
      element.ts
      template.ts
    renderer/
      renderSlideToReact.tsx
      renderSlideToHtml.ts
      renderElementToHtml.ts
    importer/
      importHtmlAsSandbox.ts
      convertHtmlToSlideDoc.ts
    exporter/
      exportDeckToHtml.ts
      exportSlideToPng.ts
    history/
      editorHistory.ts

  editor/
    EditorShell.tsx
    Canvas.tsx
    SlideNavigator.tsx
    Toolbar.tsx
    PropertyPanel.tsx
    ElementLayer.tsx
    SelectionBox.tsx
    ResizeHandles.tsx

  templates/
    registry.ts
    techCover.ts
    threeCards.ts
    leftTextRightVisual.ts
    timeline.ts
    comparison.ts

  ai/
    generateTemplateSlots.ts
    convertHtmlToElements.ts
    refineSlideDoc.ts

  app/
    App.tsx
```

## Runtime Data Flow

### Editing flow

```text
User interaction
  -> editor action
  -> reducer updates DeckDoc
  -> React renderer re-renders canvas
```

### Export flow

```text
DeckDoc
  -> static HTML renderer
  -> standalone HTML file
```

### Import flow v0

```text
HTML file
  -> read text
  -> create HtmlElement
  -> insert as one slide
```

### Template flow

```text
TemplateDoc + slot values
  -> instantiate SlideDoc
  -> render/edit/export
```

### AI flow, later

```text
User prompt
  -> AI returns structured slot JSON
  -> template engine creates SlideDoc
  -> user edits result visually
```

## State Management

Use `useReducer` for editor state in early versions.

Avoid Redux initially.

Recommended state shape:

```ts
type EditorState = {
  deck: DeckDoc;
  currentSlideId: string;
  selectedElementIds: string[];
  zoom: number;
  history: DeckDoc[];
  future: DeckDoc[];
};
```

## Rendering Strategy

There should be two renderers:

1. editor renderer: SlideDoc -> React components
2. export renderer: SlideDoc -> standalone HTML string

The editor should not directly mutate DOM nodes. It should update structured JSON state.

## Coordinate System

Use fixed slide coordinates.

Default slide size:

```text
width: 960
height: 540
aspect ratio: 16:9
```

Element position should be stored in slide coordinates, not screen coordinates.

## Import Philosophy

Do not promise perfect editable import for arbitrary HTML.

Support three levels:

1. sandbox import: preserve full HTML as one HtmlElement
2. AI-assisted conversion: convert major elements to SlideElements
3. hybrid import: preserve complex background, extract editable text/shapes

P0 only needs sandbox import.

## Template Philosophy

Templates should control layout. AI should fill slots.

Bad:

```text
AI directly writes arbitrary HTML every time
```

Good:

```text
AI returns JSON slot values -> template renderer creates stable SlideDoc
```

## Security Notes

Imported HTML may contain scripts or external resources.

P0 should sanitize or sandbox imported HTML:

- do not execute imported scripts
- prefer iframe sandbox for preview
- strip `<script>` tags for exported editable HTML
- treat imported HTML as untrusted content

## Engineering Principle

Build the editor kernel first. Add AI after the document model and editor interactions are stable.
