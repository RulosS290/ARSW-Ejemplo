const express = require('express');
const mongoose = require('mongoose');
const path = require('path'); // Importar el módulo path

const mongoURI = 'mongodb+srv://Diego:EbCQvMczJcS61E5q@arsw.tw8lk.mongodb.net/todoApp?retryWrites=true&w=majority&appName=ARSW';

mongoose.connect(mongoURI)
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch((err) => console.error('Error de conexión a MongoDB:', err));

// Definir el esquema de datos para una tarea (Task)
const taskSchema = new mongoose.Schema({
  name: String,
  completed: Boolean
});

// Crear el modelo (colección de MongoDB)
const Task = mongoose.model('Task', taskSchema);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para obtener todas las tareas
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ruta para agregar una nueva tarea
app.post('/tasks', async (req, res) => {
  const { name, completed } = req.body;
  try {
    const newTask = new Task({ name, completed });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ruta para eliminar una tarea
app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedTask = await Task.findByIdAndDelete(id);
    if (!deletedTask) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.json(deletedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ruta para actualizar una tarea
app.put('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name, completed: req.body.completed },
      { new: true } // Devuelve el documento actualizado
    );
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ruta para el archivo HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor escuchando en puerto ${port}`);
});

