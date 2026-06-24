# Architecture Decisions

## ADR 001: Use SlideDoc JSON as the source of truth

Decision:

The editor state is a structured DeckDoc / SlideDoc JSON object.

Reason:

Raw HTML strings are difficult to edit visually. A structured model enables selection, dragging, resizing, property editing, undo/redo, and template rendering.

Consequence:

Imported or AI-generated HTML must either be wrapped as HtmlElement or converted into structured SlideElements.

## ADR 002: Build editor before AI

Decision:

The first implementation should focus on the editor kernel, not AI generation.

Reason:

AI HTML generation has already been validated. The missing product value is control: visual editing, import, export, and templates.

Consequence:

Initial Codex tasks should implement schema, renderer, editor interactions, importer, exporter, and persistence first.

## ADR 003: Treat arbitrary HTML import as sandbox content first

Decision:

P0 imports HTML as an HtmlElement instead of trying to perfectly convert it.

Reason:

Arbitrary HTML-to-editable-elements conversion is a hard problem. Sandbox import gives immediate utility without overengineering.

Consequence:

Full editable conversion becomes a later AI-assisted enhancement.

## ADR 004: Use template slots for stable generation

Decision:

Template-based generation should use TemplateDoc + TemplateSlot + slot values.

Reason:

Free-form AI HTML generation is unstable. Templates provide layout stability and repeatability.

Consequence:

AI should generate slot JSON in template mode, not final arbitrary HTML.

## ADR 005: Stay local-first in early versions

Decision:

Use localStorage for persistence in early versions.

Reason:

Login, database, sync, and multi-user collaboration are too expensive for a personal-developer MVP.

Consequence:

Cloud features are deferred until the editor proves useful.
