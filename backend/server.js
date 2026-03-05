const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.log('❌ MongoDB Error:', err));

// Todo Schema
const todoSchema = new mongoose.Schema({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false }
});

const Todo = mongoose.model('Todo', todoSchema);

// Routes

// Get all todos
app.get('/todos', async (req, res) => {
  console.log('GET /todos - Fetching all todos');
  try {
    const todos = await Todo.find();
    console.log(`Found ${todos.length} todos`);
    res.json(todos);
  } catch (err) {
    console.error('Error fetching todos:', err);
    res.status(500).json({ error: err.message });
  }
});

// Add new todo
app.post('/todos', async (req, res) => {
  console.log('POST /todos - Adding new todo:', req.body);
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    const newTodo = new Todo({ text: text.trim() });
    const savedTodo = await newTodo.save();
    console.log('Todo created:', savedTodo);
    res.json(savedTodo);
  } catch (err) {
    console.error('Error creating todo:', err);
    res.status(500).json({ error: err.message });
  }
});

// Toggle complete
app.put('/todos/:id/toggle', async (req, res) => {
  console.log(`PUT /todos/${req.params.id}/toggle - Toggling completion:`, req.body);
  try {
    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      { completed: req.body.completed },
      { new: true }
    );
    if (!todo) {
      console.log('Todo not found for ID:', req.params.id);
      return res.status(404).json({ error: 'Todo not found' });
    }
    console.log('Todo toggled:', todo);
    res.json(todo);
  } catch (err) {
    console.error('Error toggling todo:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update todo text
app.put('/todos/:id', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      { text: text.trim() },
      { new: true }
    );
    
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    res.json(todo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete todo
app.delete('/todos/:id', async (req, res) => {
  try {
    const deletedTodo = await Todo.findByIdAndDelete(req.params.id);
    if (!deletedTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json({ message: 'Todo deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
  console.log(`Available routes:`);
  console.log(`- GET /todos`);
  console.log(`- POST /todos`);
  console.log(`- PUT /todos/:id/toggle`);
  console.log(`- PUT /todos/:id`);
  console.log(`- DELETE /todos/:id`);
});