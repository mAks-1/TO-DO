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
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(true);

  const API_URL = "http://127.0.0.1:8000/api/todos";

  // Отримати список ToDo
  useEffect(() => {
  fetch(API_URL)
    .then((res) => res.json())
    .then((data) => {
      console.log("Received Todos:", data);  // Виводимо отримані дані
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
    if (!newTodo.trim()) return;

    const taskPayload = {
      title: newTodo,
      description: "",
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
      setNewTodo("");
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
      title: todo.title,        // Додаємо обов'язкові поля
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
    <div>
      <h1>ToDo List</h1>
      <div>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Enter a task..."
        />
        <button onClick={addTodo}>Add</button>
      </div>
      <ul>
        {todos.length === 0 ? (
          <p>No todos yet!</p>
        ) : (
          todos.map((todo) => {
            if (!todo.task_id) {
              console.error("Missing task_id for todo:", todo);
              return null;  // Якщо немає task_id, ми пропускаємо цей елемент
            }
            return (
              <li key={todo.task_id} style={{ textDecoration: todo.completed ? "line-through" : "none" }}>
                {todo.title}
                <button onClick={() => toggleCompleted(todo.task_id)}>
                  {todo.completed ? "Mark Incomplete" : "Mark Completed"}
                </button>
                <button onClick={() => deleteTodo(todo.task_id)}>❌</button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
