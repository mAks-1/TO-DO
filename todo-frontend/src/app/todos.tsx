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
  const [newTodo, setNewTodo] = useState({
    title: "",
    description: ""
  });
  const [loading, setLoading] = useState(true);

  const API_URL = "http://127.0.0.1:8000/api/todos";

  // Отримати список ToDo
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

  // Додати новий ToDo
  const addTodo = async () => {
    if (!newTodo.title.trim()) return;

    const taskPayload = {
      title: newTodo.title,
      description: newTodo.description,
      completed: false,
    };

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

  // Помітити завдання як виконане або невиконане
  const toggleCompleted = async (id: number) => {
    if (id === undefined) {
      console.error("Task ID is undefined");
      return;
    }

    const todo = todos?.find((todo) => todo.task_id === id);
    if (todo) {
      const updatedTodo = {
        title: todo.title,
        description: todo.description,
        completed: !todo.completed
      };

      try {
        const response = await fetch(`${API_URL}/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedTodo),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error details:", errorData);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const updatedTask = await response.json();
        setTodos((prevTodos) =>
          prevTodos ? prevTodos.map((task) =>
            task.task_id === id ? updatedTask : task
          ) : []
        );
      } catch (error) {
        console.error("Error updating task:", error);
      }
    }
  };

  // Видалити ToDo
  const deleteTodo = async (id: number) => {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    setTodos((prevTodos) => prevTodos?.filter((todo) => todo.task_id !== id) || []);
  };

  if (loading) return <p>Loading...</p>;
  if (!todos) return <p>Error loading todos.</p>;

  return (
    <div className="todo-container">
      <h1>ToDo List</h1>
      <div className="add-todo-form">
        <input
          type="text"
          value={newTodo.title}
          onChange={(e) => setNewTodo({...newTodo, title: e.target.value})}
          placeholder="Task title..."
        />
        <textarea
          value={newTodo.description}
          onChange={(e) => setNewTodo({...newTodo, description: e.target.value})}
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
              <div className="todo-content">
                <h3>{todo.title}</h3>
                {todo.description && <p>{todo.description}</p>}
              </div>
              <div className="todo-actions">
                <button
                  onClick={() => toggleCompleted(todo.task_id)}
                  className={todo.completed ? "incomplete" : "complete"}
                >
                  {todo.completed ? "Undo" : "Complete"}
                </button>
                <button
                  onClick={() => deleteTodo(todo.task_id)}
                  className="delete"
                >
                  Delete
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}