# Template Engine

## Purpose

The template engine makes slide generation stable.

AI should not freely generate arbitrary slide HTML when repeatability matters. Instead, AI or the user should provide structured slot values. The template engine converts those slot values into SlideDoc elements.

## Principle

Bad flow:

```text
Prompt -> AI generates arbitrary HTML -> unstable output
```

Preferred flow:

```text
Prompt -> structured slot JSON -> TemplateDoc -> SlideDoc -> Renderer
```

## TemplateDoc

```ts
type TemplateDoc = {
  id: string;
  name: string;
  category:
    | "cover"
    | "agenda"
    | "content"
    | "comparison"
    | "timeline"
    | "summary";
  width: number;
  height: number;
  slots: TemplateSlot[];
  baseElements: SlideElement[];
};
```

## TemplateSlot

```ts
type TemplateSlot = {
  id: string;
  name: string;
  type: "title" | "subtitle" | "body" | "image" | "metric" | "list";
  required: boolean;
  maxLength?: number;
  targetElementId: string;
};
```

## TemplateInstance

```ts
type TemplateInstance = {
  templateId: string;
  values: Record<string, string | string[] | number>;
};
```

## Example: Tech Cover Template

```ts
const techCoverTemplate: TemplateDoc = {
  id: "tech-cover-001",
  name: "Tech Cover",
  category: "cover",
  width: 960,
  height: 540,
  slots: [
    {
      id: "title",
      name: "Title",
      type: "title",
      required: true,
      maxLength: 28,
      targetElementId: "el-title"
    },
    {
      id: "subtitle",
      name: "Subtitle",
      type: "subtitle",
      required: false,
      maxLength: 60,
      targetElementId: "el-subtitle"
    }
  ],
  baseElements: [
    {
      id: "bg",
      type: "shape",
      shape: "rect",
      x: 0,
      y: 0,
      width: 960,
      height: 540,
      zIndex: 0,
      style: { fill: "#08111f" }
    },
    {
      id: "el-title",
      type: "text",
      x: 80,
      y: 180,
      width: 760,
      height: 72,
      zIndex: 2,
      text: "{{title}}",
      style: {
        fontSize: 52,
        fontWeight: 800,
        color: "#ffffff",
        textAlign: "left"
      }
    },
    {
      id: "el-subtitle",
      type: "text",
      x: 82,
      y: 270,
      width: 700,
      height: 36,
      zIndex: 2,
      text: "{{subtitle}}",
      style: {
        fontSize: 22,
        fontWeight: 400,
        color: "#94a3b8",
        textAlign: "left"
      }
    }
  ]
};
```

## Slot Filling

Input:

```json
{
  "title": "AI Coding Workflow",
  "subtitle": "From idea to runnable product with agentic coding"
}
```

Output:

```ts
SlideDoc
```

The engine should deep-clone `baseElements`, find slot placeholders, and replace them with slot values.

## Required Built-in Templates for v0.1/v0.2

Start with five templates:

1. Tech Cover
2. Title + Three Cards
3. Left Text + Right Visual
4. Timeline
5. Comparison

## AI Usage

AI should return slot JSON, not free HTML.

Example prompt intent:

```text
Given this topic, choose a template and fill its slots. Return only JSON.
```

Example AI output:

```json
{
  "templateId": "three-cards-001",
  "values": {
    "title": "Core Benefits",
    "card1Title": "Fast Drafting",
    "card1Body": "Generate a first version quickly.",
    "card2Title": "Editable Output",
    "card2Body": "Every element remains controllable.",
    "card3Title": "Stable Layout",
    "card3Body": "Templates prevent random layout drift."
  }
}
```

## Template Validation

Template validation should check:

- every required slot has a value
- text does not exceed maxLength when possible
- every targetElementId exists
- target element type matches slot type
- output SlideDoc is valid

## Why This Matters

Free-form HTML generation is powerful but unstable. Template-driven generation gives the user repeatability, while still allowing AI to help with content.
