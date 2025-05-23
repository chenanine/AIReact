// packages/aireact/src/hooks.ts
// We need a reference to _performRender from render.ts, this creates a circular dependency if imported directly.
// This will be solved by having a central "scheduler" or by passing the render function.
// For now, let's assume _performRender is globally available or passed.
// This is a common challenge in early hook implementations.
// Let's make _performRender an export from render.ts and import it here.

import { _performRender } from './render'; // This will be callable

let states: any[] = [];
let hookIndex: number = 0;

// These are not strictly needed in hooks.ts if render.ts manages them via _performRender
// let rootComponent: (() => AIReactNode) | null = null;
// let rootContainer: Node | null = null;

export function useState<T>(initialState: T): [T, (newState: T | ((prevState: T) => T)) => void] {
  const currentIndex = hookIndex;
  // If state for this hook index doesn't exist, initialize it
  if (states[currentIndex] === undefined) {
    states[currentIndex] = initialState;
  }

  const setState = (newState: T | ((prevState: T) => T)) => {
    const currentState = states[currentIndex];
    if (typeof newState === 'function') {
      states[currentIndex] = (newState as (prevState: T) => T)(currentState);
    } else {
      states[currentIndex] = newState;
    }
    
    // Call the main render function to update the UI
    _performRender(); // Call without args
  };

  hookIndex++;
  return [states[currentIndex], setState];
}

// Called by _performRender in render.ts before a render pass
export function _resetHookSystem() {
  hookIndex = 0;
  // `states` array is intentionally NOT cleared here.
  // useState relies on hookIndex to pick up the correct state slot.
  // If a component unmounts and mounts again, its state should ideally be fresh
  // unless we implement more complex state preservation, which is beyond this initial step.
}
