# Codex Task Plan

This document defines the first implementation tasks for Codex or another coding agent.

Do not ask Codex to build the full product in one task. Each issue must be small, testable, and scoped.

## Task 1: Initialize React TypeScript App

### Title

Initialize Vite React TypeScript project

### Goal

Create the base app structure for HTML Slide Editor.

### Requirements

- Vite
- React
- TypeScript
- minimal CSS setup
- no backend
- no database
- no login

### Acceptance Criteria

- `npm install` works
- `npm run dev` works
- app opens to a simple editor shell page
- project has `src/` structure prepared

---

## Task 2: Introduce SlideDoc Data Model

### Title

Refactor: introduce DeckDoc and SlideDoc schema

### Goal

Create the core document types.

### Requirements

Add TypeScript types for:

- DeckDoc
- SlideDoc
- SlideElement
- TextElement
- ShapeElement
- HtmlElement
- Background
- Theme

### Acceptance Criteria

- types live under `src/core/schema/`
- app can create a default DeckDoc with one blank slide
- no raw `htmlContent` slide model is used as the primary document model

---

## Task 3: Render SlideDoc to Canvas

### Title

Editor: render SlideDoc on fixed 16:9 canvas

### Goal

Render structured slides in the editor.

### Requirements

- create Canvas component
- render slide background
- render TextElement
- render ShapeElement rect
- render HtmlElement as bounded container or iframe

### Acceptance Criteria

- default slide renders at 960 x 540 logical size
- sample text element is visible
- sample rectangle element is visible
- zIndex order is respected

---

## Task 4: Add Element Selection and Dragging

### Title

Editor: add selectable and draggable elements

### Goal

Allow users to select and move elements.

### Requirements

- click element to select
- show selection outline
- drag selected element
- update x/y in SlideDoc state
- delete selected element

### Acceptance Criteria

- dragging updates JSON state
- selected element is visually highlighted
- Delete or Backspace removes selected element

---

## Task 5: Add Resize Handles

### Title

Editor: add resize handles for slide elements

### Goal

Allow users to resize elements like PPT objects.

### Requirements

- show handles when selected
- support corner resize
- update width/height in SlideDoc state
- maintain minimum size

### Acceptance Criteria

- text/shape/html elements can be resized
- values persist after interaction

---

## Task 6: Add Text Editing and Property Panel

### Title

Editor: add text editing and property panel

### Goal

Allow basic PPT-like text editing.

### Requirements

- add TextElement button
- double-click text to edit
- property panel for x/y/width/height
- property panel for fontSize, color, fontWeight

### Acceptance Criteria

- user can add text
- user can edit text content
- user can change font size and color
- changes update SlideDoc state

---

## Task 7: Add HTML File Import as Sandbox Slide

### Title

Import: add HTML file import as sandbox slide

### Goal

Allow importing external AI-generated HTML.

### Requirements

- upload `.html` or `.htm` file
- read file as text
- sanitize scripts and event handlers
- create a new SlideDoc with one HtmlElement
- render it in canvas

### Acceptance Criteria

- user can import an HTML file
- imported HTML appears as a slide
- scripts are not executed
- slide can be saved/exported

---

## Task 8: Export DeckDoc to Standalone HTML

### Title

Export: export DeckDoc to standalone HTML

### Goal

Export editable deck data into a viewable HTML presentation.

### Requirements

- convert each SlideDoc to static HTML
- include minimal presentation controls
- support next/previous slide
- preserve text, shape, and html elements

### Acceptance Criteria

- exported file opens in browser
- all slides are visible
- navigation works
- element positions match editor preview closely

---

## Task 9: Add localStorage Persistence

### Title

Storage: save and load deck from localStorage

### Goal

Make the editor usable across refreshes.

### Requirements

- save current DeckDoc to localStorage
- load saved DeckDoc on app start
- provide reset option

### Acceptance Criteria

- refresh does not lose deck
- reset creates a clean blank deck

---

## Task 10: Add Slot-based Template Rendering

### Title

Templates: add slot-based template rendering

### Goal

Create stable slide generation without AI.

### Requirements

- add TemplateDoc schema
- add template registry
- add at least three templates
- allow user to input slot values
- instantiate SlideDoc from template

### Acceptance Criteria

- user can select a template
- user can fill title/body slots
- generated slide is editable
- output does not depend on AI

---

## Task 11: Add AI Slot JSON Generation

### Title

AI: generate template slot JSON

### Goal

Use AI to fill templates, not freely generate arbitrary HTML.

### Requirements

- user enters topic/instruction
- AI returns `templateId` and `values`
- validate slot JSON
- instantiate SlideDoc

### Acceptance Criteria

- AI output is JSON
- invalid JSON shows error
- generated slide uses template engine
- AI does not directly write final HTML in template mode

## Execution Rule

Build in this order:

```text
schema -> renderer -> editor interactions -> import -> export -> templates -> AI
```

Do not start with AI.
