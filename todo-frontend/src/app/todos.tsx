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
      headers: {"Content-Type": "application/json"},
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
}