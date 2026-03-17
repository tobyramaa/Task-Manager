import React, { useState, useEffect } from "react";
import InputField from "./components/InputField";
import { TrashIcon, CheckIcon } from "@heroicons/react/24/solid";

const API_URL = "http://localhost:3000/tasks";

const App = () => {
  const [taskTitle, setTaskTitle] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // FETCH TASKS
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        setTasks(data);
      } catch (err) {
        setError("Failed to fetch tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // ADD TASK (POST + Optimistic UI)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!taskTitle.trim()) {
      alert("Task title cannot be empty");
      return;
    }

    const newTask = {
      id: Date.now().toString(),
      title: taskTitle,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    // Optimistic update
    setTasks((prev) => [...prev, newTask]);
    setTaskTitle("");

    try {
      await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTask),
      });

      setSuccess("Task added!");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      // rollback if failed
      setTasks((prev) => prev.filter((task) => task.id !== newTask.id));
      setError("Failed to add task");
    }
  };

  // DELETE TASK (Optimistic)
  const handleDelete = async (id) => {
    const previousTasks = [...tasks];

    // Optimistic remove
    setTasks((prev) => prev.filter((task) => task.id !== id));

    try {
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      setTasks(previousTasks); // rollback
      setError("Failed to delete task");
    }
  };

  // TOGGLE COMPLETE (PATCH)
  const toggleComplete = async (task) => {
    const updatedTask = { ...task, completed: !task.completed };

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? updatedTask : t))
    );

    try {
      await fetch(`${API_URL}/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed: updatedTask.completed }),
      });
    } catch (err) {
      setError("Failed to update task");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cyan-700 py-10">
      <div className="bg-slate-300 shadow-lg rounded-xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Task Manager
        </h1>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <InputField
            label="Task Title"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="Enter task title"
          />

          <button
            disabled={!taskTitle.trim()}
            className={`py-2 rounded-lg text-white font-medium transition-all duration-300
              ${
                taskTitle.trim()
                  ? "bg-cyan-600 hover:bg-cyan-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
          >
            Create Task
          </button>
        </form>

        {/* STATUS */}
        {!loading && success && (
          <p className="text-green-600 text-center mt-3">{success}</p>
        )}
        {!loading && error && (
          <p className="text-red-600 text-center mt-3">{error}</p>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="flex justify-center mt-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
          </div>
        ) : (
          <>
            {tasks.length === 0 && (
              <p className="text-center mt-4 text-gray-600">
                No tasks yet
              </p>
            )}

            {/* TASK LIST */}
            <div className="mt-4 space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white p-3 rounded-lg shadow flex justify-between items-center transition-all duration-300 hover:scale-[1.02]"
                >
                  <div>
                    <span
                      className={`font-medium cursor-pointer ${
                        task.completed ? "line-through text-gray-400" : ""
                      }`}
                      onClick={() => toggleComplete(task)}
                    >
                      {task.title}
                    </span>

                    <p className="text-xs text-gray-500">
                      {new Date(task.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* COMPLETE BUTTON */}
                    <button
                      onClick={() => toggleComplete(task)}
                      className="text-green-600 hover:text-green-800"
                      title="Complete Task"
                    >
                      <CheckIcon className="h-5 w-5" />
                    </button>

                    {/* DELETE BUTTON */}
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete Task"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default App;