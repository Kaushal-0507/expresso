import React, { useEffect, useState } from "react";
import axios from "../utils/axios";
import { toast } from "react-hot-toast";
import { useTheme } from "../contexts/ThemeProvider";
import Avatar from "./Avatar";
import { formatPostDate } from "../common/formatPostDate";

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("/api/admin/users");
        if (response.data && response.data.success && Array.isArray(response.data.users)) {
          setUsers(response.data.users);
        } else {
          console.error("Invalid data format:", response.data);
          toast.error("Received invalid data format");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error(error.response?.data?.message || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-japnica border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto rounded-lg ${theme === "dark" ? "bg-mineShaft" : "bg-white"}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className={theme === "dark" ? "bg-mineShaftLight" : "bg-gray-50"}>
          <tr>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}>
              User
            </th>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}>
              Email
            </th>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}>
              Role
            </th>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}>
              Joined
            </th>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}>
              Followers
            </th>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}>
              Following
            </th>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}>
              Status
            </th>
          </tr>
        </thead>
        <tbody className={`divide-y ${theme === "dark" ? "divide-gray-700" : "divide-gray-200"}`}>
          {Array.isArray(users) && users.length > 0 ? (
            users.map((user) => (
              <tr key={user._id} className={theme === "dark" ? "bg-mineShaft" : "bg-white"}>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center">
                    <Avatar profileUrl={user.profileImg} className="h-8 w-8" />
                    <div className="ml-4">
                      <div className={`text-sm font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}>
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm text-gray-500">@{user.username}</div>
                    </div>
                  </div>
                </td>
                <td className={`whitespace-nowrap px-6 py-4 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-900"}`}>
                  {user.email}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <span className={`rounded-full px-2 py-1 text-xs ${
                    user.role === "admin" 
                      ? "bg-purple-100 text-purple-800" 
                      : "bg-blue-100 text-blue-800"
                  }`}>
                    {user.role || "user"}
                  </span>
                </td>
                <td className={`whitespace-nowrap px-6 py-4 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-900"}`}>
                  {formatPostDate(user.createdAt)}
                </td>
                <td className={`whitespace-nowrap px-6 py-4 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-900"}`}>
                  {user.followers?.length || 0}
                </td>
                <td className={`whitespace-nowrap px-6 py-4 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-900"}`}>
                  {user.followings?.length || 0}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <span className={`rounded-full px-2 py-1 text-xs ${
                    user.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
