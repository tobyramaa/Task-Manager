import React, { useState, useEffect } from "react";
import InputField from "./components/InputField";
import { TrashIcon, CheckIcon } from "@heroicons/react/24/solid";

const API_URL = "https://dummyjson.com/todos?limit=10";

const App = () => {
  const [taskTitle, setTaskTitle] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        const mappedTasks = data.todos.map((task) => ({
          id: task.id.toString(),
          title: task.todo,
          completed: task.completed,
          createdAt: new Date().toISOString(),
        }));
        setTasks(mappedTasks);
      } catch {
        setError("Failed to fetch tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const newTask = {
      id: Date.now().toString(),
      title: taskTitle,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => [...prev, newTask]);
    setTaskTitle("");
    setSuccess("Task added!");
    setTimeout(() => setSuccess(""), 2000);
  };

  const handleDelete = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

 
  const toggleComplete = (task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t))
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cyan-700 py-10">
      <div className="bg-slate-300 shadow-lg rounded-xl p-6 w-90 max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Task Manager</h1>

        
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

        
        {!loading && success && (
          <p className="text-green-600 text-center mt-3">{success}</p>
        )}
        {!loading && error && (
          <p className="text-red-600 text-center mt-3">{error}</p>
        )}

       
        {loading ? (
          <div className="flex justify-center mt-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
          </div>
        ) : (
          <>
            {tasks.length === 0 && (
              <p className="text-center mt-4 text-gray-600">No tasks yet</p>
            )}


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
                    
                    <button
                      onClick={() => toggleComplete(task)}
                      className="text-green-600 hover:text-green-800"
                      title="Complete Task"
                    >
                      <CheckIcon className="h-5 w-5" />
                    </button>


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