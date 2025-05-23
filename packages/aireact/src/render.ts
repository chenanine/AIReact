// packages/aireact/src/render.ts
import { AIReactNode, TEXT_ELEMENT } from './createElement';
import { Fragment } from './Fragment';
import { _resetHookSystem } from './hooks';

let currentRootVNode: AIReactNode | null = null; // Stores the VDOM tree of the root from the last successful render
let rootContainerNode: Node | null = null; // The actual DOM container for the app
let getAppFnFromInitialRender: (() => AIReactNode) | null = null; // Store the initial app function

// Main public render function (entry point)
export function render(element: AIReactNode, container: Node) {
    rootContainerNode = container;
    // Store a function that can produce the root VNode.
    // If element.type is a function (component), appFn calls it. Otherwise, it returns the element directly.
    getAppFnFromInitialRender = typeof element.type === 'function' 
        ? () => (element.type as Function)(element.props) as AIReactNode 
        : () => element;
    
    _performRender(); // Trigger the initial render using the stored initial app function
}

// Function to trigger a re-render (e.g., from useState or initial render)
export function _performRender() { 
    if (!rootContainerNode) {
        console.error("AIReact: Root container not set. Cannot perform render.");
        return;
    }
    
    _resetHookSystem(); // Reset hook index for the new render pass

    let newRootVNode: AIReactNode | null = null;

    // Determine the function to generate the new VDOM tree
    if (currentRootVNode && typeof currentRootVNode.type === 'function') {
        // This is a re-render triggered by useState, use the existing root component's type and props.
        newRootVNode = (currentRootVNode.type as Function)(currentRootVNode.props) as AIReactNode;
    } else if (getAppFnFromInitialRender) {
        // This is the initial render, or a subsequent render triggered by an external call to _performRender
        // that doesn't have a currentRootVNode (e.g. if we were to allow replacing the root).
        newRootVNode = getAppFnFromInitialRender();
    } else {
        console.error("AIReact: Cannot determine the new root VNode to render. No current component or initial app function.");
        return;
    }
    
    if (newRootVNode) {
        reconcileTree(rootContainerNode, newRootVNode, currentRootVNode);
        currentRootVNode = newRootVNode; // Update the current VDOM tree
    } else {
        console.error("AIReact: New root VNode is null, rendering aborted.");
    }
}

function reconcileTree(container: Node, newVNode: AIReactNode | null, oldVNode: AIReactNode | null) {
    if (!oldVNode && newVNode) { // Case 1: Adding a new node
        newVNode.dom = createDomElement(newVNode); 
        if (newVNode.type === Fragment) { 
            // For Fragment, its .dom is a DocumentFragment. Append its children to the container.
            newVNode.props.children.forEach(child => reconcileTree(container, child, null));
        } else if (newVNode.dom) { // newVNode.dom would be undefined if createDomElement returns so for Fragment
            container.appendChild(newVNode.dom);
            // Text elements don't have children in VDOM props that need further reconciliation here
            if (newVNode.type !== TEXT_ELEMENT) { 
                 newVNode.props.children.forEach(child => reconcileTree(newVNode.dom!, child, null));
            }
        }
    } else if (oldVNode && !newVNode) { // Case 2: Removing an old node
        if (oldVNode.dom) {
            // If oldVNode is a Fragment, its .dom might be a DocumentFragment and not in the main DOM.
            // Its children would have been directly in the container or parent.
            // The children of a Fragment are handled by reconcileChildrenArray when oldChildren exist but newChildren don't.
            if (oldVNode.type === Fragment) {
                // If oldVNode is fragment, its children were in 'container'. Remove them.
                oldVNode.props.children.forEach(child => reconcileTree(container, null, child));
            } else if (oldVNode.dom.parentNode) { // For non-fragments, remove their DOM if parented
                 oldVNode.dom.remove();
            }
        }
    } else if (newVNode && oldVNode && newVNode.type !== oldVNode.type) { // Case 3: Type changed, replace
        if (oldVNode.dom) {
            const newDom = createDomElement(newVNode); // newVNode.dom is set here
            if (newVNode.type === Fragment) { // New is Fragment
                if (oldVNode.type === Fragment) { // Old was also Fragment
                    // Remove old fragment's children
                    oldVNode.props.children.forEach(child => reconcileTree(container, null, child));
                } else if (oldVNode.dom.parentNode) { // Old was not Fragment, remove its DOM
                    oldVNode.dom.remove();
                }
                // Add new fragment's children to container
                newVNode.props.children.forEach(child => reconcileTree(container, child, null)); 
            } else if (newDom) { // New is not Fragment
                if (oldVNode.type === Fragment) { // Old was Fragment
                    // Remove old fragment's children
                    oldVNode.props.children.forEach(child => reconcileTree(container, null, child));
                    container.appendChild(newDom); // Append new DOM
                } else if (oldVNode.dom.parentNode) { // Old was not Fragment and in DOM
                    oldVNode.dom.replaceWith(newDom);
                } else { // Old was not Fragment and not in DOM (e.g. child of a fragment that was removed)
                     container.appendChild(newDom);
                }
                // newVNode.dom is already set by createDomElement
                 if (newVNode.type !== TEXT_ELEMENT) { // Text elements don't have children
                    // Children of the new node are reconciled against the new DOM element
                    newVNode.props.children.forEach(child => reconcileTree(newDom, child, null));
                }
            }
        }
    } else if (newVNode && oldVNode && newVNode.type === oldVNode.type) { // Case 4: Same type, diff props and children
        newVNode.dom = oldVNode.dom; // Reuse DOM node

        if (newVNode.type === Fragment) {
            // Children of a Fragment are reconciled directly into the containing parent DOM
            reconcileChildrenArray(container, newVNode.props.children, oldVNode.props.children);
        } else if (newVNode.type === TEXT_ELEMENT) {
            if (newVNode.props.nodeValue !== oldVNode.props.nodeValue && newVNode.dom) {
                (newVNode.dom as Text).nodeValue = newVNode.props.nodeValue as string;
            }
        } else { // Regular DOM element
            if (newVNode.dom) { // Should always exist here as we reused oldVNode.dom
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
        // Pass parentDom as the container for children. If parent was Fragment, this was handled in reconcileTree
        reconcileTree(parentDom, newChildVNode, oldChildVNode);
    }
}

function createDomElement(vnode: AIReactNode): Node {
    let dom: Node;
    if (vnode.type === Fragment) {
        // Fragments themselves don't have a DOM representation in the tree.
        // They return a DocumentFragment. reconcileTree handles appending children to the correct parent.
        dom = document.createDocumentFragment();
    } else if (vnode.type === TEXT_ELEMENT) {
        dom = document.createTextNode(vnode.props.nodeValue as string);
    } else {
        dom = document.createElement(vnode.type as string);
        // Apply initial properties for new DOM elements
        updateDomProperties(dom as HTMLElement, vnode.props, {});
    }
    vnode.dom = dom; // Assign the created DOM node to the virtual element
    return dom;
}
        
function updateDomProperties(dom: HTMLElement, newProps: any, oldProps: any) {
    // Remove listeners and properties that are no longer present
    for (const name in oldProps) {
        if (name === "children" || name === "key") continue;

        if (!(name in newProps)) {
            if (name.startsWith("on")) {
                const eventType = name.toLowerCase().substring(2);
                dom.removeEventListener(eventType, oldProps[name]);
            } else if (name === "style") {
                // Remove all old styles by iterating
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

    // Add new or update existing listeners and properties
    for (const name in newProps) {
        if (name === "children" || name === "key") continue;

        if (oldProps[name] === newProps[name] && name !== "style") continue; // Skip if property hasn't changed (except style)

        if (name.startsWith("on")) {
            const eventType = name.toLowerCase().substring(2);
            // Remove old listener before adding new one if it changed
            if (oldProps[name] && oldProps[name] !== newProps[name]) {
                dom.removeEventListener(eventType, oldProps[name]);
            }
            // Add new listener if it's new or changed
            if (oldProps[name] !== newProps[name] || !oldProps[name]) {
               dom.addEventListener(eventType, newProps[name]);
            }
        } else if (name === "style" && typeof newProps[name] === 'object') {
            // Clear styles from oldProps that are not in newProps
            if(typeof oldProps[name] === 'object') {
                for (const styleName in oldProps[name]) {
                    if (!(newProps[name] && newProps[name][styleName] !== undefined)) {
                        (dom.style as any)[styleName] = '';
                    }
                }
            }
            // Apply new/changed styles
            for (const styleName in newProps[name]) {
                if((dom.style as any)[styleName] !== newProps[name][styleName]) {
                   (dom.style as any)[styleName] = newProps[name][styleName];
                }
            }
        } else if (name === "className") {
            // Only update if className actually changed
            if (dom.className !== newProps[name]) {
                 dom.className = newProps[name];
            }
        } else {
            // For other props, set them directly as attributes
            // Check if attribute actually changed to avoid unnecessary setAttribute
            if (dom.getAttribute(name) !== String(newProps[name])) { // Ensure string conversion for comparison and set
                 dom.setAttribute(name, String(newProps[name]));
            }
        }
    }
}
