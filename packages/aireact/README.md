# AIReact: A Lightweight React-like Frontend Framework

Welcome to AIReact! This framework is a learning tool designed to explore the core concepts behind modern frontend libraries like React. It implements a subset of React's features, providing a hands-on understanding of virtual DOM, components, state management, hooks, JSX, and reconciliation.

**Version:** 0.0.1 (Experimental)

## Core Concepts

*   **Virtual DOM:** AIReact, like React, uses a virtual representation of the DOM to optimize updates. Changes are first applied to the virtual DOM, then efficiently reconciled with the actual browser DOM.
*   **Components:** Build your UI by composing reusable, stateful, or stateless functional components.
*   **JSX:** Use JSX, an XML-like syntax extension for JavaScript, to declaratively describe your UI.
*   **Hooks (`useState`):** Manage local state within your functional components using the `useState` hook.
*   **Reconciliation:** AIReact implements a basic diffing algorithm to update only the necessary parts of the DOM when state changes, along with selective re-rendering for components.

## Setup & Installation

AIReact is not yet published to npm. To use it in a local project:

1.  **Clone the Repository:** If you haven't already, clone the repository where AIReact is developed.
2.  **Build AIReact:** Navigate to `packages/aireact` and run `npm run build`. This will compile the TypeScript source to JavaScript in the `dist` folder.
3.  **Link AIReact (Recommended for local development):**
    *   In `packages/aireact`, run `npm link`.
    *   In your project where you want to use AIReact, run `npm link aireact`.
4.  **Alternative (File Path):** You can also use a relative file path in your project's `package.json`:
    ```json
    "dependencies": {
      "aireact": "file:/path/to/your/aireact/packages/aireact"
    }
    ```
    Ensure you've built AIReact first.

### TypeScript Configuration for JSX

To use JSX with AIReact, configure your project's `tsconfig.json`:

```json
{
  "compilerOptions": {
    // ... other options
    "module": "ESNext", // Or your preferred module system
    "moduleResolution": "node", // Or "bundler"
    "jsx": "react-jsx",
    "jsxImportSource": "aireact",
    "paths": {
      // Optional: if using linked aireact and want to ensure TS resolves to source during dev
      // "aireact": ["node_modules/aireact/dist/index"], // Adjust if linked to source directly
      // "aireact/jsx-runtime": ["node_modules/aireact/dist/jsx-runtime"]
    }
    // ...
  },
  "include": ["src"] // Or your source directory
}
```
This setup uses the modern JSX transform. AIReact provides the necessary `jsx-runtime` exports.

Alternatively, for older setups or per-file control, you can use the JSX pragma:
```tsx
/** @jsx createElement */
import { createElement } from 'aireact';
// Your component code...
```
And set `"jsx": "preserve"` or `"jsx": "react"` with `"jsxFactory": "createElement"` in your `tsconfig.json`.

## Core APIs

### `createElement(type, props, ...children)` (Internal)

This function is what JSX compiles to. You typically won't call it directly if using JSX.
*   `type`: String (e.g., 'div'), Function (your component), or `Fragment`.
*   `props`: An object containing properties for the element/component.
*   `children`: Child elements or text content.

AIReact also exports `AIReactNode`, `TEXT_ELEMENT`, and `ComponentInstance` types/interfaces.

### `render(element, container)`

Renders an AIReact application into a DOM container.
```tsx
import { render } from 'aireact';
import App from './App'; // Your root component

const rootElement = document.getElementById('root');
if (rootElement) {
  render(<App />, rootElement);
}
```

### Components

Functional components are JavaScript functions that return an `AIReactNode` (usually via JSX).
```tsx
const MyComponent = ({ message }) => {
  return <div>{message}</div>;
};
```

### `useState(initialState)`

A hook to add local state to functional components.
*   Returns an array: `[currentState, setStateFunction]`.
*   `setStateFunction` updates the state and triggers a selective re-render of the component.
```tsx
import { useState } from 'aireact';

const Counter = () => {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
};
```

### `Fragment` or `<>...</>`

Allows you to return multiple elements from a component without a wrapper DOM element.
```tsx
import { Fragment } from 'aireact'; // Or just use <> </> with modern JSX setup

const MyList = () => {
  return (
    <>
      <li>Item 1</li>
      <li>Item 2</li>
    </>
  );
};
```

### Event Handling

Attach event listeners using `on<EventName>` props, like `onClick`, `onInput`, etc.
```tsx
const MyButton = () => {
  const handleClick = () => alert('Button clicked!');
  return <button onClick={handleClick}>Click Me</button>;
};
```
The event object passed to handlers is the native browser event.

## Building an Application (Example: Todo App)

The included `examples/todo-app` demonstrates how to build a simple application with AIReact. Key aspects:
*   **Root Component (`App.tsx`):** Manages global application state (like the list of todos and input text) using `useState`.
*   **Child Components (`TodoItem.tsx`):** Break down the UI into smaller, manageable pieces.
*   **Props:** Pass data and functions down from parent to child components.
*   **State Management:** Use `useState` for interactive elements.
*   **Rendering Lists:** Use `.map()` to render lists of components.

To run the example:
1. Ensure AIReact is built (`npm run build` in `packages/aireact`).
2. Ensure `aireact` is linked or correctly pathed in `examples/todo-app/package.json`.
3. Navigate to `examples/todo-app`.
4. Run `npm install` (or `lerna bootstrap --scope todo-app-example --include-dependencies` from root).
5. Run `npm run dev` to start the Parcel development server.

## Development of AIReact

*   **Location:** `packages/aireact`
*   **Build:** `npm run build` (compiles TypeScript to `dist/` and `dist/esm/`)
*   **Dev Watch:** `npm run dev` (watches for changes and rebuilds)

## Current Limitations

AIReact is a simplified framework and currently has several limitations:
*   **Hooks:** Only `useState` is implemented. No `useEffect`, `useContext`, `useReducer`, `useMemo`, `useCallback`, etc.
*   **List Reconciliation:** DOM diffing for lists is basic and does not use keys for optimized reordering or updates.
*   **Server-Side Rendering (SSR):** Not supported.
*   **Error Handling:** Error boundaries and detailed error reporting are minimal.
*   **Performance:** While selective re-rendering and basic DOM diffing are implemented, it's not as optimized as mature libraries.
*   **Event System:** Uses direct event listeners; no synthetic event system or extensive cross-browser normalization beyond what modern browsers provide.
*   **Context API:** Not implemented for global state sharing.
*   **Testing:** Unit tests are not yet part of this manual's scope (but are planned).

## Future Scope (Potential Enhancements)

*   Implement more hooks (`useEffect`, `useContext`).
*   Add a Context API.
*   Keyed list reconciliation.
*   Improved error handling and developer warnings.
*   Basic routing capabilities.
*   More comprehensive unit and integration tests.

---

Happy hacking with AIReact!
