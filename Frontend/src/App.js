import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const res = await axios.get('/api/todos');
    setTodos(res.data);
  };

  const addTodo = async () => {
    if (!newTodo.trim()) return;
    await axios.post('/api/todos', { text: newTodo });
    setNewTodo('');
    fetchTodos();
  };

  const deleteTodo = async (id) => {
    await axios.delete(`/api/todos/${id}`);
    fetchTodos();
  };

  const summarizeTodos = async () => {
    try {
      const res = await axios.post('/api/summarize');
      setStatus(res.data.message || 'Summary sent to Slack!');
    } catch (err) {
      setStatus('Failed to summarize or send to Slack.');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Todo Summary Assistant</h1>
      <input value={newTodo} onChange={e => setNewTodo(e.target.value)} placeholder="New todo" />
      <button onClick={addTodo}>Add</button>
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            {todo.text}
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <button onClick={summarizeTodos}>Summarize and Send to Slack</button>
      {status && <p>{status}</p>}
    </div>
  );
}

export default App;
