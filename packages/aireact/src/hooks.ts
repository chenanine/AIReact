// packages/aireact/src/hooks.ts
import { _performComponentReRender } from './render'; 
import { ComponentInstance } from './createElement'; // Ensure ComponentInstance is imported if not already

export let currentlyRenderingInstance: ComponentInstance | null = null;

export function _setCurrentlyRenderingInstance(instance: ComponentInstance | null): void {
  currentlyRenderingInstance = instance;
}

export function _prepareComponentForRender(instance: ComponentInstance): void {
  instance.currentHookIndex = 0;
}

export function useState<T>(initialState: T): [T, (newState: T | ((prevState: T) => T)) => void] {
  if (!currentlyRenderingInstance) {
    throw new Error("useState was called outside of an AIReact component render. This is not allowed.");
  }
  
  const instance = currentlyRenderingInstance; 

  if (!instance.hookStates) {
    instance.hookStates = [];
  }

  const currentIndex = instance.currentHookIndex;

  if (instance.hookStates[currentIndex] === undefined) {
    instance.hookStates[currentIndex] = initialState;
  }

  const setState = (newState: T | ((prevState: T) => T)) => {
    const currentState = instance.hookStates[currentIndex];
    let nextState;
    if (typeof newState === 'function') {
      nextState = (newState as (prevState: T) => T)(currentState);
    } else {
      nextState = newState;
    }

    if (currentState !== nextState) { 
        instance.hookStates[currentIndex] = nextState;
        _performComponentReRender(instance); // Call the new targeted re-render function
    }
  };

  instance.currentHookIndex++;
  return [instance.hookStates[currentIndex], setState];
}
