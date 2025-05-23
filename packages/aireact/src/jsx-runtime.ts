import { createElement, AIReactNode } from './createElement';
import { Fragment } from './Fragment';

// This is what Babel's new JSX transform ('react-jsx') expects.
// It calls jsx() for elements like <div /> and jsxs() for elements with static children array.
// For simplicity, we can make them aliases of createElement for now,
// but a proper implementation would optimize for static children.

export const jsx = (type: string | Function | typeof Fragment, props: any, key?: string): AIReactNode => {
  // The 'key' argument is part of the new JSX runtime spec.
  // We are not handling 'key' for reconciliation yet, but it's good to include it.
  // The props received here already include children if they are passed directly.
  // e.g. <div id="foo"><span>hello</span></div>
  // props would be {id: "foo", children: AIReactNode for span}

  // If children are in props, pass them as the third argument to createElement
  if (props && props.children) {
    const { children, ...restProps } = props;
    return createElement(type, { ...restProps, key }, children);
  }
  return createElement(type, { ...props, key });
};

export const jsxs = jsx; // For now, jsxs is the same as jsx.

export { Fragment }; // Export Fragment for <>...</> syntax
