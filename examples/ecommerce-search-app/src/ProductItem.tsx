import { createElement } from 'aireact';
import { Product } from './products';

interface ProductItemProps {
  product: Product;
}

export const ProductItem = ({ product }: ProductItemProps) => {
  return createElement(
    'div',
    { className: 'product-item' },
    createElement('img', { src: product.imageUrl, alt: product.name, style: { width: '100px', height: '100px' } }),
    createElement('h3', null, product.name),
    createElement('p', null, `Price: $${product.price.toFixed(2)}`),
    createElement('p', null, `Category: ${product.category}`)
  );
};
