import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  // Fetch todos from backend
  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:5000/todos')
      .then(res => {
        setTodos(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching todos:', err);
        setLoading(false);
      });
  }, []);

  // Add new todo
  const addTodo = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    axios.post('http://localhost:5000/todos', { text: input.trim() })
      .then(res => {
        setTodos([...todos, res.data]);
        setInput('');
        setLoading(false);
      })
      .catch(err => {
        console.error('Error adding todo:', err);
        alert('Error adding todo. Please try again.');
        setLoading(false);
      });
  };

  // Toggle complete
  const toggleTodo = (id, completed) => {
    axios.put(`http://localhost:5000/todos/${id}/toggle`, { completed: !completed })
      .then(res => {
        setTodos(todos.map(todo => 
          todo._id === id ? res.data : todo
        ));
      })
      .catch(err => {
        console.error('Error toggling todo:', err);
        alert('Error updating todo. Please try again.');
      });
  };

  // Delete todo
  const deleteTodo = (id) => {
    if (!window.confirm('Are you sure you want to delete this todo?')) {
      return;
    }

    axios.delete(`http://localhost:5000/todos/${id}`)
      .then(() => {
        setTodos(todos.filter(todo => todo._id !== id));
      })
      .catch(err => {
        console.error('Error deleting todo:', err);
        alert('Error deleting todo. Please try again.');
      });
  };

  // Start editing
  const startEditing = (id, currentText) => {
    setEditingId(id);
    setEditText(currentText);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null);
    setEditText('');
  };

  // Save edited todo
  const saveEdit = (id) => {
    if (!editText.trim()) {
      alert('Todo text cannot be empty');
      return;
    }

    axios.put(`http://localhost:5000/todos/${id}`, { text: editText.trim() })
      .then(res => {
        setTodos(todos.map(todo => 
          todo._id === id ? res.data : todo
        ));
        setEditingId(null);
        setEditText('');
      })
      .catch(err => {
        console.error('Error updating todo:', err);
        alert('Error updating todo. Please try again.');
      });
  };

  return (
    <div className="App">
      <div className="container">
        <h1>My Todo List</h1>

        <form onSubmit={addTodo} className="add-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What needs to be done?"
            className="todo-input"
            disabled={loading}
          />
          <button type="submit" className="add-btn" disabled={loading || !input.trim()}>
            {loading ? 'Adding...' : 'Add'}
          </button>
        </form>

        {loading && todos.length === 0 && (
          <div className="loading">Loading todos...</div>
        )}

        <ul className="todo-list">
          {todos.map(todo => (
            <li key={todo._id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo._id, todo.completed)}
                className="todo-checkbox"
              />
              
              {editingId === todo._id ? (
                <div className="edit-container">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="edit-input"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit(todo._id);
                      if (e.key === 'Escape') cancelEditing();
                    }}
                    autoFocus
                  />
                  <div className="edit-buttons">
                    <button 
                      onClick={() => saveEdit(todo._id)}
                      className="save-btn"
                      disabled={!editText.trim()}
                    >
                      Save
                    </button>
                    <button onClick={cancelEditing} className="cancel-btn">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <span 
                    className={`todo-text ${todo.completed ? 'completed' : ''}`}
                    onDoubleClick={() => startEditing(todo._id, todo.text)}
                    title="Double-click to edit"
                  >
                    {todo.text}
                  </span>
                  <div className="todo-actions">
                    <button 
                      onClick={() => startEditing(todo._id, todo.text)}
                      className="edit-btn"
                      title="Edit"
                    >
                      ✎
                    </button>
                    <button 
                      onClick={() => deleteTodo(todo._id)}
                      className="delete-btn"
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>

        {todos.length === 0 && !loading && (
          <p className="empty">No todos yet! Add one above to get started 🎉</p>
        )}
        
        {todos.length > 0 && (
          <div className="todo-stats">
            <span>
              Total: {todos.length} | 
              Completed: {todos.filter(t => t.completed).length} | 
              Remaining: {todos.filter(t => !t.completed).length}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;