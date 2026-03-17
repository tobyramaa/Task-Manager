import React, { useState, useEffect } from "react";
import InputField from "./components/InputField";
import { TrashIcon, CheckIcon } from "@heroicons/react/24/solid";

const API_URL = "http://localhost:3000/tasks"; 

const App = () => {
  const [taskTitle, setTaskTitle] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch tasks from backend
  const fetchTasks = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Add new task
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return alert("Task title cannot be empty");

    const newTask = {
      title: taskTitle,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    // Optimistic UI
    const tempTask = { ...newTask, id: Date.now() };
    setTasks((prev) => [...prev, tempTask]);
    setTaskTitle("");
    setSuccess("Task created successfully!");
    setTimeout(() => setSuccess(""), 2000);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });
      const savedTask = await res.json();
      // Replace temp task with backend task (correct ID)
      setTasks((prev) =>
        prev.map((task) => (task.id === tempTask.id ? savedTask : task))
      );
    } catch (err) {
      setTasks((prev) => prev.filter((task) => task.id !== tempTask.id));
      setError("Failed to create task");
    }
  };

  // Delete task
  const handleDelete = async (taskId) => {
    const prevTasks = [...tasks];
    setTasks((prev) => prev.filter((task) => task.id !== taskId));

    try {
      const res = await fetch(`${API_URL}/${taskId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete task");
    } catch (err) {
      setTasks(prevTasks); // rollback
      setError(err.message);
    }
  };

  // Toggle completed
  const handleToggle = async (taskId) => {
    const prevTasks = [...tasks];
    const taskToToggle = tasks.find((t) => t.id === taskId);
    const updatedTask = { ...taskToToggle, completed: !taskToToggle.completed };

    // Optimistic UI
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? updatedTask : task))
    );

    try {
      const res = await fetch(`${API_URL}/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: updatedTask.completed }),
      });
      if (!res.ok) throw new Error("Failed to update task");
    } catch (err) {
      setTasks(prevTasks); // rollback
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cyan-700 py-10">
      <div className="bg-slate-300 shadow-lg rounded-xl p-4 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Task Manager</h1>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <InputField
            label="Task Title"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="Enter task title"
          />

          <button
            disabled={!taskTitle.trim() || loading}
            className={`py-2 rounded-lg text-white font-medium transition
              ${
                taskTitle.trim() && !loading
                  ? "bg-cyan-600 hover:bg-cyan-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
          >
            {loading ? "Saving..." : "Create Task"}
          </button>
        </form>

        {/* Messages */}
        {success && <p className="text-green-600 text-center mt-3">{success}</p>}
        {error && <p className="text-red-600 text-center mt-3">{error}</p>}

        {/* Task List */}
        {loading && (
          <div className="flex justify-center mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
          </div>
        )}

        {!loading && tasks.length === 0 && (
          <p className="text-center mt-4 text-gray-600">No tasks yet</p>
        )}

        <div className="mt-4 space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white p-3 rounded-lg shadow flex justify-between items-center"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`cursor-pointer ${
                    task.completed ? "line-through text-gray-400" : "font-medium"
                  }`}
                  onClick={() => handleToggle(task.id)}
                >
                  {task.title}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleToggle(task.id)}
                  className="text-green-600 hover:text-green-800"
                  title="Complete Task"
                >
                  <CheckIcon className="h-6 w-6" />
                </button>

                <button
                  onClick={() => handleDelete(task.id)}
                  className="text-red-600 hover:text-red-800"
                  title="Delete Task"
                >
                  <TrashIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;