import { Fragment } from './Fragment';

export interface AIReactNode {
  type: string | Function | typeof Fragment; // string for DOM elements, Function for components, or Fragment
  props: {
    [key: string]: any;
    children: AIReactNode[];
  };
  dom?: Node; // Optional: reference to the actual DOM node
}

export function createElement(
  type: string | Function | typeof Fragment,
  props: { [key: string]: any } | null,
  ...children: (AIReactNode | string | number | null | undefined)[]
): AIReactNode {
  const validatedProps: { [key: string]: any; children: AIReactNode[] } = {
    ...(props || {}),
    children: children
      .flat() // Flatten arrays of children (e.g., from map operations)
      .filter(child => child !== null && child !== undefined && typeof child !== 'boolean') // Filter out null/undefined/boolean children
      .map(child => {
        if (typeof child === 'string' || typeof child === 'number') {
          // Wrap primitive children in a special 'TEXT_ELEMENT' type
          return createTextElement(String(child));
        }
        return child; // Already an AIReactNode
      }) as AIReactNode[], // Assert as AIReactNode[] after filtering and mapping
  };

  return {
    type,
    props: validatedProps,
  };
}

// Helper function to create text elements, making them conform to AIReactNode structure
// We'll need a way to distinguish these later in the render function.
export const TEXT_ELEMENT = 'TEXT_ELEMENT';

function createTextElement(text: string): AIReactNode {
  return {
    type: TEXT_ELEMENT,
    props: {
      nodeValue: text,
      children: [], // Text elements don't have children
    },
  };
}
