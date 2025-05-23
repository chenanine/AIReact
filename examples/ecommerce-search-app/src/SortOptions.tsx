import { createElement } from 'aireact';

export type SortOption = 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | '';


interface SortOptionsProps {
  currentSort: SortOption;
  onSortChange: (sortOption: SortOption) => void;
}

export const SortOptions = ({ currentSort, onSortChange }: SortOptionsProps) => {
  const options: { value: SortOption; label: string }[] = [
    { value: '', label: 'Default' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Name: A to Z' },
    { value: 'name-desc', label: 'Name: Z to A' },
  ];

  return createElement(
    'div',
    { className: 'sort-options' },
    createElement('label', { htmlFor: 'sort-select' }, 'Sort by: '),
    createElement(
      'select',
      {
        id: 'sort-select',
        value: currentSort,
        onchange: (e: Event) => onSortChange((e.target as HTMLSelectElement).value as SortOption),
      },
      ...options.map(opt =>
        createElement('option', { value: opt.value }, opt.label)
      )
    )
  );
};
