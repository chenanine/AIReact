// No JSX pragma needed due to tsconfig.json settings for react-jsx and jsxImportSource
import { render, useState, Fragment } from 'aireact'; // createElement is used by JSX transform

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

// TodoItem Component
const TodoItem = ({ todo, onToggle, onRemove }: { todo: Todo; onToggle: () => void; onRemove: () => void }) => {
  return (
    <li style={{ textDecoration: todo.completed ? 'line-through' : 'none', marginBottom: '5px' }}>
      <span onClick={onToggle} style={{ cursor: 'pointer', marginRight: '10px' }}>
        {todo.text}
      </span>
      <button onClick={onRemove} style={{ padding: '2px 5px', fontSize: '0.8em' }}>Remove</button>
    </li>
  );
};

// Main App Component
const App = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputText, setInputText] = useState<string>('');

  const handleAddTodo = () => {
    if (inputText.trim() === '') return;
    setTodos([...todos, { id: Date.now(), text: inputText, completed: false }]);
    setInputText('');
  };

  const handleToggleTodo = (id: number) => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const handleRemoveTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const handleInputChange = (event: Event) => {
    // Basic event handling - assuming input event target value
    const target = event.target as HTMLInputElement;
    setInputText(target.value);
  };

  return (
    <>
      <h1>AIReact Todo List</h1>
      <div style={{ display: 'flex', marginBottom: '10px' }}>
        <input
          type="text"
          value={inputText}
          onInput={handleInputChange} // Using onInput for immediate feedback
          placeholder="Add a new todo"
          style={{ flexGrow: 1, marginRight: '5px', padding: '5px' }}
        />
        <button onClick={handleAddTodo} style={{ padding: '5px 10px' }}>Add</button>
      </div>
      <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
        {todos.map(todo => (
          <TodoItem
            key={todo.id} // Key prop is good practice, though AIReact doesn't use it yet
            todo={todo}
            onToggle={() => handleToggleTodo(todo.id)}
            onRemove={() => handleRemoveTodo(todo.id)}
          />
        ))}
      </ul>
      {todos.length === 0 && <p>No todos yet. Add some!</p>}
    </>
  );
};

// Render the App
const container = document.getElementById('root');
if (container) {
  render(<App />, container);
} else {
  console.error('Root container not found for AIReact Todo App!');
}
