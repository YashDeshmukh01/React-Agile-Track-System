// UserProfile.jsx
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { UserContext } from "../../context/UserContext";
import "./UserProfile.css"; // Import the external CSS

const UserProfile = () => {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState("employee");
  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:4000/users");
        if (user?.role === "admin") {
          setUsers(response.data.filter((user) => user?.role !== "admin"));
        } else {
          setSelectedUser(user);
          fetchTasks(user?.id);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, [user]);

  const fetchTasks = async (userId) => {
    try {
      const response = await axios.get(
        `http://localhost:4000/tasks?assignedTo=${userId}`
      );
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleGetHistory = (userId) => {
    setSelectedUser(users.find((user) => user?.id === userId));
    fetchTasks(userId);
  };

  const handleAddUser = async (event) => {
    event.preventDefault();
    try {
      await axios.post("http://localhost:4000/users", {
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole,
      });
      const updatedUsers = await axios.get("http://localhost:4000/users");
      setUsers(updatedUsers.data.filter((user) => user?.role !== "admin"));
      setShowForm(false);
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserRole("employee");
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      window.confirm(`Are you sure you want to delete user with ID ${userId}?`)
    ) {
      try {
        await axios.delete(`http://localhost:4000/users/${userId}`);
        setUsers(users.filter((user) => user.id !== userId));
        if (selectedUser?.id === userId) {
          setSelectedUser(null);
          setTasks([]);
        }
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  return (
    <div className="profile-container">
      <h2 className="profile-title">User Profiles</h2>
      {user?.role === "admin" && (
        <div className="admin-section">
          <button className="toggle-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Add New User"}
          </button>

          {showForm && (
            <form onSubmit={handleAddUser} className="user-form">
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Password:</label>
                <input
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Role:</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  required
                  className="form-select"
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button type="submit" className="submit-btn">
                Create User
              </button>
            </form>
          )}

          <ul className="user-list">
            {users.map((user) => (
              <li key={user?.id} className="user-item">
                <div className="user-info">
                  <strong>Name:</strong> {user?.name} <br />
                  <strong>Email:</strong> {user?.email}
                </div>
                <div className="user-actions">
                  <button
                    onClick={() => handleGetHistory(user?.id)}
                    className="action-btn history-btn"
                  >
                    Get History
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user?.id)}
                    className="action-btn delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {user?.role !== "admin" && (
        <div className="tasks-section">
          <h3 className="section-title">Tasks Worked By {user?.name}</h3>
          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task.id} className="task-item">
                <strong>Title:</strong> {task.title} <br />
                <strong>Description:</strong> {task.description} <br />
                <strong>Status:</strong> {task.status}
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedUser && user?.role === "admin" && (
        <div className="tasks-section">
          <h3 className="section-title">Tasks Worked By {selectedUser.name}</h3>
          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task.id} className="task-item">
                <strong>Title:</strong> {task.title} <br />
                <strong>Description:</strong> {task.description} <br />
                <strong>Status:</strong> {task.status}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
