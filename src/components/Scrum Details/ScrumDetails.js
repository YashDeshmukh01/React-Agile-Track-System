import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { UserContext } from "../../context/UserContext";
import { useHistory } from "react-router-dom";

const ScrumDetails = ({ scrum }) => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(UserContext);
  const history = useHistory();

  useEffect(() => {
    const checkUser = () => {
      const loggedInUser = JSON.parse(localStorage.getItem("user"));
      if (!loggedInUser) {
        history.push("/login");
      }
    };

    checkUser();
  }, [history]);

  useEffect(() => {
    const fetchTasksAndUsers = async () => {
      try {
        setLoading(true);
        const tasksResponse = await axios.get(
          `http://localhost:4000/tasks?scrumId=${scrum.id}`
        );
        const fetchedTasks = tasksResponse.data;
        console.log("Fetched Tasks:", fetchedTasks); // Debug
        setTasks(fetchedTasks);

        const usersResponse = await axios.get("http://localhost:4000/users");
        console.log("Fetched Users:", usersResponse.data); // Debug
        const scrumUsers = usersResponse.data.filter((user) =>
          fetchedTasks.some(
            (task) =>
              task.assignedTo && String(task.assignedTo) === String(user.id)
          )
        );
        console.log("Filtered Scrum Users:", scrumUsers); // Debug
        setUsers(scrumUsers);
      } catch (error) {
        console.error("Error fetching tasks and users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasksAndUsers();
  }, [scrum.id]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await axios.patch(`http://localhost:4000/tasks/${taskId}`, {
        status: newStatus,
        history: [
          ...tasks.find((task) => task.id === taskId).history,
          {
            status: newStatus,
            date: new Date().toISOString().split("T")[0],
          },
        ],
      });

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  return (
    <div>
      <h3>Scrum Details for {scrum.name}</h3>
      <h4>Tasks</h4>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <strong>{task.title}:</strong> {task.description} -{" "}
            <em>{task.status}</em>
            {user?.role === "admin" && (
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(task.id, e.target.value)}
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            )}
          </li>
        ))}
      </ul>
      <h4>Users</h4>
      {loading ? (
        <p>Loading users...</p>
      ) : users.length > 0 ? (
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              {user.name} ({user.email})
            </li>
          ))}
        </ul>
      ) : (
        <p>No users assigned to tasks.</p>
      )}
    </div>
  );
};

export default ScrumDetails;
