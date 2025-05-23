import { createElement, render } from 'aireact';
import { App } from './App';
// Import styles if your setup requires it for CSS to be bundled/applied
// import './styles.css'; 

const rootElement = document.getElementById('ecommerce-root');

if (rootElement) {
  render(createElement(App, null), rootElement);
} else {
  console.error('Root element #ecommerce-root not found in the DOM.');
}
