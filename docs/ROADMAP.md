# Roadmap

## Phase 0: Documentation and Scope Lock

Goal: define the product clearly before coding.

Deliverables:

- README
- Product Spec
- Architecture
- SlideDoc Schema
- Template Engine design
- HTML Importer design
- Codex task plan

Status: initial documentation phase.

## Phase 1: Editor Kernel v0.1

Goal: create the minimum usable HTML slide editor.

Required features:

- Vite + React + TypeScript project setup
- DeckDoc / SlideDoc / SlideElement types
- fixed 16:9 canvas
- render SlideDoc to React canvas
- add text element
- add rectangle element
- select element
- drag element
- resize element
- delete element
- basic property panel
- localStorage save/load
- export deck to standalone HTML

Non-goals:

- AI generation
- PPTX export
- login
- database
- collaboration

## Phase 2: HTML Import v0.1

Goal: import external HTML as editable project content.

Required features:

- upload `.html` file
- sanitize imported HTML
- create slide with HtmlElement
- render imported HTML in bounded canvas
- export imported HTML slide with deck

Non-goal:

- perfect HTML-to-elements conversion

## Phase 3: Template Engine v0.1

Goal: generate stable slides from predefined templates.

Required features:

- TemplateDoc schema
- TemplateSlot schema
- template registry
- instantiate template with slot values
- at least three built-in templates:
  - Tech Cover
  - Title + Three Cards
  - Left Text + Right Visual

## Phase 4: AI-assisted Stable Generation

Goal: use AI without sacrificing stability.

Required features:

- user prompt -> template choice + slot JSON
- slot validation
- instantiate SlideDoc from AI slot output
- never let AI freely generate final arbitrary HTML for template mode

## Phase 5: Editing Quality Improvements

Goal: make the editor feel closer to lightweight PPT.

Candidate features:

- undo/redo
- duplicate element
- z-index controls
- align left/right/center
- distribute elements
- snap-to-grid
- multi-select
- keyboard shortcuts
- zoom controls

## Phase 6: Export Improvements

Goal: improve deliverability.

Candidate features:

- export current slide as PNG
- export deck as PDF
- export bundled HTML package
- print-friendly mode

## Deferred

Do not prioritize these before the core editor is stable:

- PPTX import
- PPTX export
- team collaboration
- cloud workspace
- template marketplace
- paid SaaS system
- animation timeline
- chart editor
- Figma-like vector editing

## Current Strategic Priority

Build a controllable editor before adding more AI.

AI-generated HTML is already technically proven. The missing product value is:

1. editing
2. importing
3. stable template rendering
