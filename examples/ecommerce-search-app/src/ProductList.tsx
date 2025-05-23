import { createElement } from 'aireact';
import { Product } from './products';
import { ProductItem } from './ProductItem';

interface ProductListProps {
  products: Product[];
}

export const ProductList = ({ products }: ProductListProps) => {
  if (!products.length) {
    return createElement('p', null, 'No products found.');
  }

  return createElement(
    'div',
    { className: 'product-list' },
    ...products.map(product => createElement(ProductItem, { product }))
  );
};
