"use client";

import { useState, useEffect } from "react";

type Todo = {
  task_id: number;
  title: string;
  description: string;
  completed: boolean;
};

export default function Todos() {
  const [todos, setTodos] = useState<Todo[] | null>(null);
  const [newTodo, setNewTodo] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const API_URL = "http://127.0.0.1:8000/api/todos";

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        console.log("Received Todos:", data);
        setTodos(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching todos:", error);
        setLoading(false);
      });
  }, []);

  const addTodo = async () => {
    if (!newTodo.title.trim()) return;

    const taskPayload = { ...newTodo, completed: false };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskPayload),
    });

    if (response.ok) {
      const newTask = await response.json();
      setTodos((prevTodos) => (prevTodos ? [...prevTodos, newTask] : [newTask]));
      setNewTodo({ title: "", description: "" });
    } else {
      console.error("Error adding task:", response.statusText);
    }
  };

  const toggleCompleted = async (id: number) => {
    const todo = todos?.find((todo) => todo.task_id === id);
    if (!todo) return;

    const updatedTodo = { ...todo, completed: !todo.completed };

    const response = await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTodo),
    });

    if (response.ok) {
      const updatedTask = await response.json();
      setTodos((prevTodos) =>
        prevTodos ? prevTodos.map((task) => (task.task_id === id ? updatedTask : task)) : []
      );
    } else {
      console.error("Error updating task:", response.statusText);
    }
  };

  const startEditing = (todo: Todo) => {
    setEditingTodo({ ...todo });
  };

  const cancelEditing = () => {
    setEditingTodo(null);
  };

  const updateTodo = async () => {
    if (!editingTodo) return;

    const response = await fetch(`${API_URL}/${editingTodo.task_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editingTodo.title,
        description: editingTodo.description,
      }),
    });

    if (response.ok) {
      const updatedTask = await response.json();
      setTodos((prevTodos) =>
        prevTodos ? prevTodos.map((task) => (task.task_id === updatedTask.task_id ? updatedTask : task)) : []
      );
      setEditingTodo(null);
    } else {
      console.error("Error updating task:", response.statusText);
    }
  };

  const deleteTodo = async (id: number) => {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    setTodos((prevTodos) => prevTodos?.filter((todo) => todo.task_id !== id) || []);
  };

  if (loading) return <p>Loading...</p>;
  if (!todos) return <p>Error loading todos.</p>;

  return (
    <div className="todo-container">
      <div className="add-todo-form">
        <input
          type="text"
          value={newTodo.title}
          onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
          placeholder="Task title..."
        />
        <textarea
          value={newTodo.description}
          onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
          placeholder="Task description..."
        />
        <button onClick={addTodo}>Add Task</button>
      </div>
      <ul className="todo-list">
        {todos.length === 0 ? (
          <p>No todos yet!</p>
        ) : (
          todos.map((todo) => (
            <li key={todo.task_id} className={`todo-item ${todo.completed ? "completed" : ""}`}>
              {editingTodo && editingTodo.task_id === todo.task_id ? (
                <div className="edit-form">
                  <input
                    type="text"
                    value={editingTodo.title}
                    onChange={(e) => setEditingTodo({ ...editingTodo, title: e.target.value })}
                  />
                  <textarea
                    value={editingTodo.description}
                    onChange={(e) => setEditingTodo({ ...editingTodo, description: e.target.value })}
                  />
                  <button onClick={updateTodo}>Save</button>
                  <button onClick={cancelEditing}>Cancel</button>
                </div>
              ) : (
                <>
                  <div className="todo-content">
                    <h3>{todo.title}</h3>
                    {todo.description && <p>{todo.description}</p>}
                  </div>
                  <div className="todo-actions">
                    <button onClick={() => toggleCompleted(todo.task_id)}>
                      {todo.completed ? "Undo" : "Complete"}
                    </button>
                    <button onClick={() => deleteTodo(todo.task_id)}>Delete</button>
                    <button onClick={() => startEditing(todo)}>Edit</button>
                  </div>
                </>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
