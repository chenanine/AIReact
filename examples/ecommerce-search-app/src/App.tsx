import { createElement, useState, Fragment } from 'aireact';
import { mockProducts, Product } from './products';
import { ProductList } from './ProductList';
import { SearchBar } from './SearchBar';
import { FilterBar } from './FilterBar';
import { SortOptions, SortOption } from './SortOptions';

// Helper function to get unique categories from products
const getUniqueCategories = (products: Product[]): string[] => {
  const categories = new Set<string>();
  products.forEach(product => categories.add(product.category));
  return Array.from(categories);
};

export const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('');

  const availableCategories = getUniqueCategories(mockProducts);

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
  };

  const getFilteredAndSortedProducts = () => {
    let products = mockProducts;

    // Filter by search term
    if (searchTerm) {
      products = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      products = products.filter(product => product.category === selectedCategory);
    }

    // Sort products
    switch (sortOption) {
      case 'price-asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        products.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }
    return products;
  };

  const displayedProducts = getFilteredAndSortedProducts();

  return createElement(
    Fragment,
    null,
    createElement('h1', null, 'E-commerce Product Search'),
    createElement(SearchBar, { searchTerm, onSearchChange: handleSearchChange }),
    createElement(FilterBar, {
      selectedCategory,
      onCategoryChange: handleCategoryChange,
      categories: availableCategories,
    }),
    createElement(SortOptions, { currentSort: sortOption, onSortChange: handleSortChange }),
    createElement(ProductList, { products: displayedProducts })
  );
};
