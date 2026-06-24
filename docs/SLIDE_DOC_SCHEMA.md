# SlideDoc Schema

## Purpose

SlideDoc is the core document model for HTML Slide Editor.

The editor must not treat a slide as a raw HTML string. Raw HTML is only one element type for compatibility.

## DeckDoc

```ts
type DeckDoc = {
  id: string;
  title: string;
  version: string;
  theme: Theme;
  slides: SlideDoc[];
  assets: Asset[];
  templates?: TemplateDoc[];
  createdAt: string;
  updatedAt: string;
};
```

## SlideDoc

```ts
type SlideDoc = {
  id: string;
  name: string;
  width: number;
  height: number;
  background: Background;
  elements: SlideElement[];
  notes?: string;
};
```

Default size:

```ts
width = 960;
height = 540;
```

## SlideElement

```ts
type SlideElement =
  | TextElement
  | ShapeElement
  | ImageElement
  | HtmlElement
  | GroupElement;
```

## BaseElement

```ts
type BaseElement = {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  zIndex: number;
  locked?: boolean;
  visible?: boolean;
};
```

All elements use slide coordinates, not viewport coordinates.

## TextElement

```ts
type TextElement = BaseElement & {
  type: "text";
  text: string;
  style: {
    fontSize: number;
    fontWeight?: number;
    color: string;
    lineHeight?: number;
    letterSpacing?: number;
    textAlign?: "left" | "center" | "right";
    fontFamily?: string;
    opacity?: number;
  };
};
```

## ShapeElement

```ts
type ShapeElement = BaseElement & {
  type: "shape";
  shape: "rect" | "circle" | "line" | "triangle";
  style: {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    borderRadius?: number;
    opacity?: number;
  };
};
```

## ImageElement

```ts
type ImageElement = BaseElement & {
  type: "image";
  src: string;
  alt?: string;
  objectFit?: "cover" | "contain" | "fill";
};
```

## HtmlElement

```ts
type HtmlElement = BaseElement & {
  type: "html";
  html: string;
  editableLevel: "none" | "text-only" | "partial";
  sandbox?: boolean;
};
```

HtmlElement exists to support imported or AI-generated HTML that cannot yet be converted into fully editable SlideElements.

## GroupElement

```ts
type GroupElement = BaseElement & {
  type: "group";
  children: SlideElement[];
};
```

GroupElement is P1/P2. It does not need to be implemented in v0.1.

## Background

```ts
type Background =
  | { type: "solid"; color: string }
  | { type: "gradient"; value: string }
  | { type: "image"; src: string; objectFit?: "cover" | "contain" };
```

## Theme

```ts
type Theme = {
  id: string;
  name: string;
  fonts: {
    heading: string;
    body: string;
  };
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
};
```

## Asset

```ts
type Asset = {
  id: string;
  type: "image" | "font" | "html";
  name: string;
  src?: string;
  content?: string;
  createdAt: string;
};
```

## Migration from Raw HTML Slides

If importing old slides with only `htmlContent`, wrap them as HtmlElement:

```ts
const slideDoc: SlideDoc = {
  id: oldSlide.id,
  name: "Imported HTML Slide",
  width: 960,
  height: 540,
  background: { type: "solid", color: "#ffffff" },
  elements: [
    {
      id: `html-${oldSlide.id}`,
      type: "html",
      x: 0,
      y: 0,
      width: 960,
      height: 540,
      zIndex: 0,
      html: oldSlide.htmlContent,
      editableLevel: "none",
      sandbox: true
    }
  ]
};
```

## Validation Rules

- Element IDs must be unique within a slide.
- `width` and `height` must be positive.
- `zIndex` controls rendering order.
- Hidden elements should not render in export.
- Locked elements should not be draggable or editable.
- HtmlElement content must be treated as untrusted when imported.

## v0.1 Required Element Types

Only these are required for the first implementation:

- TextElement
- ShapeElement with rect only
- HtmlElement

ImageElement, GroupElement, lines, circles, and advanced shapes can come later.
