// packages/aireact/src/render.ts
import { AIReactNode, TEXT_ELEMENT, ComponentInstance } from './createElement';
import { Fragment } from './Fragment';
// Import _setCurrentlyRenderingInstance and _prepareComponentForRender from hooks.ts
// Note: ComponentInstance is also available via createElement.ts, ensure consistency.
import { _prepareComponentForRender, _setCurrentlyRenderingInstance } from './hooks';


let currentRootVNode: AIReactNode | null = null;
let rootContainerNode: Node | null = null;
let getAppFnFromInitialRender: (() => AIReactNode) | null = null;

export function render(element: AIReactNode, container: Node) {
    rootContainerNode = container;
    getAppFnFromInitialRender = typeof element.type === 'function' 
        ? () => (element.type as Function)(element.props) as AIReactNode 
        : () => element;
    _performRender();
}

// Global full re-render (still used for initial render)
export function _performRender() { 
    if (!rootContainerNode) {
        console.error("AIReact: Root container not set. Cannot perform render.");
        return;
    }
    
    let newRootVNode: AIReactNode | null = null;

    if (currentRootVNode && typeof currentRootVNode.type === 'function') {
         _setCurrentlyRenderingInstance(currentRootVNode.instance || null);
         if (currentRootVNode.instance) {
            _prepareComponentForRender(currentRootVNode.instance);
         }
        newRootVNode = (currentRootVNode.type as Function)(currentRootVNode.props) as AIReactNode;
        if (currentRootVNode.instance) {
            currentRootVNode.instance.renderedVNode = newRootVNode;
        }
        _setCurrentlyRenderingInstance(null);
    } else if (getAppFnFromInitialRender) {
        newRootVNode = getAppFnFromInitialRender();
    } else {
        console.error("AIReact: Cannot determine the new root VNode to render.");
        return;
    }
    
    if (newRootVNode) {
        reconcileTree(rootContainerNode, newRootVNode, currentRootVNode);
        currentRootVNode = newRootVNode; 
    } else {
        console.error("AIReact: New root VNode is null, rendering aborted.");
    }
}

// Selective component re-render
export function _performComponentReRender(instance: ComponentInstance) {
  if (!instance || !instance.vNode || typeof instance.vNode.type !== 'function') {
    console.error("Invalid instance provided for component re-render.", instance);
    return;
  }

  let parentDomContainer: Node | null = instance.parentDom || null;

  // Fallback logic if parentDom wasn't set (should become rarer)
  if (!parentDomContainer) {
      if (instance.renderedVNode && instance.renderedVNode.dom && instance.renderedVNode.dom.parentNode) {
          parentDomContainer = instance.renderedVNode.dom.parentNode;
          console.warn("AIReact: parentDom not found on instance, using renderedVNode.dom.parentNode.", instance);
      } else if (instance.vNode.dom && instance.vNode.dom.parentNode) {
          // This might be an anchor node for a component that rendered a fragment.
          parentDomContainer = instance.vNode.dom.parentNode;
          console.warn("AIReact: parentDom not found on instance, using vNode.dom.parentNode.", instance);
      } else {
          console.error("AIReact: Could not determine parent DOM container for component re-render. Falling back to full root render.", instance);
          _performRender(); // Global full re-render
          return;
      }
  }
  
  if (!parentDomContainer) { // Should be caught by previous block's fallback to _performRender
    console.error("AIReact: Failed to find parent DOM container for component re-render even after fallbacks.", instance);
    return;
  }

  _prepareComponentForRender(instance);
  _setCurrentlyRenderingInstance(instance);

  const newRenderedVNode = (instance.vNode.type as Function)(instance.vNode.props) as AIReactNode;

  _setCurrentlyRenderingInstance(null);

  reconcileTree(parentDomContainer, newRenderedVNode, instance.renderedVNode);
  
  instance.renderedVNode = newRenderedVNode;
  // Update the host component's VNode .dom reference to the new rendered DOM
  instance.vNode.dom = newRenderedVNode.dom; 
}


function reconcileTree(container: Node, newVNode: AIReactNode | null, oldVNode: AIReactNode | null) {
    if (typeof newVNode?.type === 'function') {
        const componentHostVNode = newVNode;
        
        let instance: ComponentInstance = componentHostVNode.instance || oldVNode?.instance || {
            vNode: componentHostVNode,
            hookStates: [],
            currentHookIndex: 0,
        };
        instance.vNode = componentHostVNode; 
        componentHostVNode.instance = instance;

        _prepareComponentForRender(instance);
        _setCurrentlyRenderingInstance(instance);
        
        const renderedVNodeFromComponent = (componentHostVNode.type as Function)(componentHostVNode.props) as AIReactNode;
        instance.renderedVNode = renderedVNodeFromComponent;

        _setCurrentlyRenderingInstance(null);
        
        instance.parentDom = container; // Store the container where this component's output is placed

        reconcileTree(container, instance.renderedVNode, oldVNode?.instance?.renderedVNode || null);
        
        componentHostVNode.dom = instance.renderedVNode.dom;
        return;
    }

    // Rest of the reconciliation logic for non-component nodes
    if (!oldVNode && newVNode) {
        newVNode.dom = createDomElement(newVNode); 
        if (newVNode.type === Fragment) { 
            newVNode.props.children.forEach(child => reconcileTree(container, child, null));
        } else if (newVNode.dom) {
            container.appendChild(newVNode.dom);
            if (newVNode.type !== TEXT_ELEMENT) { 
                 newVNode.props.children.forEach(child => reconcileTree(newVNode.dom!, child, null));
            }
        }
    } else if (oldVNode && !newVNode) {
        if (oldVNode.dom) {
            if (oldVNode.type === Fragment) {
                oldVNode.props.children.forEach(child => reconcileTree(container, null, child));
            } else if (oldVNode.type === 'function' && oldVNode.instance?.renderedVNode) { // Removing a component
                 reconcileTree(container, null, oldVNode.instance.renderedVNode); // Remove what the component rendered
            } else if (oldVNode.dom.parentNode) {
                 oldVNode.dom.remove();
            }
        }
    } else if (newVNode && oldVNode && newVNode.type !== oldVNode.type) {
        const oldEffectiveDom = oldVNode.instance?.renderedVNode?.dom || oldVNode.dom;
        const oldEffectiveType = oldVNode.instance?.renderedVNode?.type || oldVNode.type;
        const oldEffectiveChildren = oldVNode.instance?.renderedVNode?.props.children || oldVNode.props.children;

        if (oldEffectiveType === Fragment) {
            if (oldEffectiveChildren) {
                oldEffectiveChildren.forEach((child: AIReactNode) => reconcileTree(container, null, child));
            }
        } else if (oldEffectiveDom && oldEffectiveDom.parentNode) {
            oldEffectiveDom.remove();
        }
        
        newVNode.dom = createDomElement(newVNode);
        if (newVNode.type === Fragment) {
            newVNode.props.children.forEach(child => reconcileTree(container, child, null));
        } else if (newVNode.dom) {
            container.appendChild(newVNode.dom);
            if (newVNode.type !== TEXT_ELEMENT) {
                newVNode.props.children.forEach(child => reconcileTree(newVNode.dom, child, null));
            }
        }

    } else if (newVNode && oldVNode && newVNode.type === oldVNode.type) { // Same type (and not a function)
        newVNode.dom = oldVNode.dom; 

        if (newVNode.type === Fragment) {
            reconcileChildrenArray(container, newVNode.props.children, oldVNode.props.children);
        } else if (newVNode.type === TEXT_ELEMENT) {
            if (newVNode.props.nodeValue !== oldVNode.props.nodeValue && newVNode.dom) {
                (newVNode.dom as Text).nodeValue = newVNode.props.nodeValue as string;
            }
        } else { 
            if (newVNode.dom) { 
               updateDomProperties(newVNode.dom as HTMLElement, newVNode.props, oldVNode.props);
               reconcileChildrenArray(newVNode.dom, newVNode.props.children, oldVNode.props.children);
            }
        }
    }
}

function reconcileChildrenArray(parentDom: Node, newChildren: AIReactNode[], oldChildren: AIReactNode[]) {
    const len = Math.max(newChildren ? newChildren.length : 0, oldChildren ? oldChildren.length : 0);
    for (let i = 0; i < len; i++) {
        const newChildVNode = newChildren ? newChildren[i] : null;
        const oldChildVNode = oldChildren ? oldChildren[i] : null;
        reconcileTree(parentDom, newChildVNode, oldChildVNode);
    }
}

function createDomElement(vnode: AIReactNode): Node {
    let dom: Node;
    if (vnode.type === Fragment) {
        dom = document.createDocumentFragment();
    } else if (vnode.type === TEXT_ELEMENT) {
        dom = document.createTextNode(vnode.props.nodeValue as string);
    } else { 
        dom = document.createElement(vnode.type as string);
        updateDomProperties(dom as HTMLElement, vnode.props, {});
    }
    vnode.dom = dom; 
    return dom;
}
        
function updateDomProperties(dom: HTMLElement, newProps: any, oldProps: any) {
    // Remove
    for (const name in oldProps) {
        if (name === "children" || name === "key") continue;
        if (!(name in newProps)) {
            if (name.startsWith("on")) {
                const eventType = name.toLowerCase().substring(2);
                dom.removeEventListener(eventType, oldProps[name]);
            } else if (name === "style") {
                for (const styleName in oldProps[name]) {
                    (dom.style as any)[styleName] = '';
                }
            } else if (name === "className") {
                dom.removeAttribute("class");
            } else {
                dom.removeAttribute(name);
            }
        }
    }

    // Add/Update
    for (const name in newProps) {
        if (name === "children" || name === "key") continue;
        if (oldProps[name] === newProps[name] && name !== "style") continue;

        if (name.startsWith("on")) {
            const eventType = name.toLowerCase().substring(2);
            if (oldProps[name]) { dom.removeEventListener(eventType, oldProps[name]); }
            dom.addEventListener(eventType, newProps[name]);
        } else if (name === "style" && typeof newProps[name] === 'object') {
            if(typeof oldProps[name] === 'object') {
                for (const styleName in oldProps[name]) {
                    if (!(newProps[name] && newProps[name][styleName] !== undefined)) {
                        (dom.style as any)[styleName] = '';
                    }
                }
            }
            for (const styleName in newProps[name]) {
                if((dom.style as any)[styleName] !== newProps[name][styleName]) {
                   (dom.style as any)[styleName] = newProps[name][styleName];
                }
            }
        } else if (name === "className") {
            if (dom.className !== newProps[name]) { dom.className = newProps[name]; }
        } else {
            if (dom.getAttribute(name) !== String(newProps[name])) {
                 dom.setAttribute(name, String(newProps[name]));
            }
        }
    }
}
