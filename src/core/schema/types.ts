export type DeckDoc = {
  id: string;
  title: string;
  version: string;
  theme: Theme;
  slides: SlideDoc[];
  assets: Asset[];
  templates?: unknown[];
  createdAt: string;
  updatedAt: string;
};

export type SlideDoc = {
  id: string;
  name: string;
  width: number;
  height: number;
  background: Background;
  elements: SlideElement[];
  notes?: string;
};

export type SlideElement = TextElement | ShapeElement | HtmlElement;

export type BaseElement = {
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

export type TextElement = BaseElement & {
  type: 'text';
  text: string;
  style: {
    fontSize: number;
    fontWeight?: number;
    color: string;
    lineHeight?: number;
    letterSpacing?: number;
    textAlign?: 'left' | 'center' | 'right';
    fontFamily?: string;
    opacity?: number;
  };
};

export type ShapeElement = BaseElement & {
  type: 'shape';
  shape: 'rect';
  style: {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    borderRadius?: number;
    opacity?: number;
  };
};

export type HtmlElement = BaseElement & {
  type: 'html';
  html: string;
  editableLevel: 'none' | 'text-only' | 'partial';
  sandbox?: boolean;
};

export type Background =
  | { type: 'solid'; color: string }
  | { type: 'gradient'; value: string }
  | { type: 'image'; src: string; objectFit?: 'cover' | 'contain' };

export type Theme = {
  id: string;
  name: string;
  fonts: { heading: string; body: string };
  colors: { primary: string; secondary: string; background: string; text: string };
};

export type Asset = {
  id: string;
  type: 'image' | 'font' | 'html';
  name: string;
  src?: string;
  content?: string;
  createdAt: string;
};
