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


  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        setTodos(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching todos:", error);
        setLoading(false);
      });
  }, []);


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


const toggleCompleted = async (id: number) => {
  const todo = todos?.find((todo) => todo.task_id === id);
  if (todo) {
    const updatedTodo = { ...todo, completed: !todo.completed };

    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTodo),
    });

    if (response.ok) {
      const updatedTask = await response.json();
      setTodos((prevTodos) =>
        prevTodos ? prevTodos.map((task) =>
          task.task_id === id ? updatedTask : task
        ) : []
      );
    }
  }
};


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
          todos.map((todo) => (
            <li key={todo.task_id} style={{ textDecoration: todo.completed ? "line-through" : "none" }}>
              {todo.title}
              <button onClick={() => toggleCompleted(todo.task_id)}>
                {todo.completed ? "Mark Incomplete" : "Mark Completed"}
              </button>
              <button onClick={() => deleteTodo(todo.task_id)}>❌</button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
