declare module 'react' {
  export type CSSProperties = Record<string, string | number | undefined>;
  export type PointerEvent<T = Element> = globalThis.PointerEvent & { currentTarget: T; stopPropagation(): void };
  export function useEffect(effect: () => void | (() => void), deps?: unknown[]): void;
  export function useMemo<T>(factory: () => T, deps: unknown[]): T;
  export function useState<T>(initial: T | (() => T)): [T, (value: T | ((previous: T) => T)) => void];
  export const StrictMode: (props: { children?: unknown }) => unknown;
}

declare module 'react-dom/client' {
  export function createRoot(element: Element): { render(children: unknown): void };
}

declare module 'react/jsx-runtime' {
  export const jsx: unknown;
  export const jsxs: unknown;
  export const Fragment: unknown;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elementName: string]: any;
  }
}

declare module 'vite' {
  export function defineConfig(config: unknown): unknown;
}

declare module '*.css';
