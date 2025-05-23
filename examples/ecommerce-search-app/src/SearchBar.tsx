import { createElement } from 'aireact';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const SearchBar = ({ searchTerm, onSearchChange }: SearchBarProps) => {
  return createElement(
    'div',
    { className: 'search-bar' },
    createElement('input', {
      type: 'text',
      placeholder: 'Search products...',
      value: searchTerm,
      oninput: (e: Event) => onSearchChange((e.target as HTMLInputElement).value),
    })
  );
};
