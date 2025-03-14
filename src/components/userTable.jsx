import React, { useEffect, useState } from "react";
import axios from "../utils/axios";
import { toast } from "react-hot-toast";

const UserTable = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("/api/admin/users");
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to fetch users");
      }
    };

    fetchUsers();
  }, []);

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            Username
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            Email
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            Registration Date
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            Total Posts
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            Status
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 bg-white">
        {users.map((user) => (
          <tr key={user._id}>
            <td className="whitespace-nowrap px-6 py-4">{user.username}</td>
            <td className="whitespace-nowrap px-6 py-4">{user.email}</td>
            <td className="whitespace-nowrap px-6 py-4">
              {new Date(user.createdAt).toLocaleDateString()}
            </td>
            <td className="whitespace-nowrap px-6 py-4">
              {user.posts?.length || 0}
            </td>
            <td className="whitespace-nowrap px-6 py-4">
              <span
                className={`rounded-full px-2 py-1 text-xs ${
                  user.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {user.isActive ? "Active" : "Inactive"}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default UserTable;
