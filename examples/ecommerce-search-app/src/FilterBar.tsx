import { createElement } from 'aireact';

interface FilterBarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
}

export const FilterBar = ({ selectedCategory, onCategoryChange, categories }: FilterBarProps) => {
  return createElement(
    'div',
    { className: 'filter-bar' },
    createElement('label', { htmlFor: 'category-select' }, 'Filter by Category: '),
    createElement(
      'select',
      {
        id: 'category-select',
        value: selectedCategory,
        onchange: (e: Event) => onCategoryChange((e.target as HTMLSelectElement).value),
      },
      createElement('option', { value: '' }, 'All Categories'),
      ...categories.map(category =>
        createElement('option', { value: category }, category)
      )
    )
  );
};
