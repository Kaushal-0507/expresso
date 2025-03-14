import React, { useEffect, useState } from "react";
import axios from "../utils/axios";
import { toast } from "react-hot-toast";
import { useTheme } from "../contexts/ThemeProvider";
import Avatar from "./Avatar";
import { formatPostDate } from "../common/formatPostDate";

const PostTable = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get("/api/admin/posts");
        if (response.data && response.data.success && Array.isArray(response.data.posts)) {
          setPosts(response.data.posts);
        } else {
          console.error("Invalid data format:", response.data);
          toast.error("Received invalid data format");
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
        toast.error(error.response?.data?.message || "Failed to fetch posts");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
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
              Creator
            </th>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}>
              Content
            </th>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}>
              Media Type
            </th>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}>
              Created At
            </th>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}>
              Likes
            </th>
            <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === "dark" ? "text-gray-300" : "text-gray-500"}`}>
              Comments
            </th>
          </tr>
        </thead>
        <tbody className={`divide-y ${theme === "dark" ? "divide-gray-700" : "divide-gray-200"}`}>
          {Array.isArray(posts) && posts.length > 0 ? (
            posts.map((post) => (
              <tr key={post._id} className={theme === "dark" ? "bg-mineShaft" : "bg-white"}>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center">
                    <Avatar profileUrl={post.owner?.profileImg} className="h-8 w-8" />
                    <div className="ml-4">
                      <div className={`text-sm font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-900"}`}>
                        {post.owner?.firstName} {post.owner?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">@{post.owner?.username}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className={`max-w-xs text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-900"}`}>
                    {post.content?.length > 100 
                      ? `${post.content.substring(0, 100)}...` 
                      : post.content}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <span className={`rounded-full px-2 py-1 text-xs ${
                    post.mediaUrl
                      ? post.mediaUrl.includes('/image/')
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {post.mediaUrl 
                      ? post.mediaUrl.includes('/image/') 
                        ? "Image" 
                        : "Video"
                      : "Text"}
                  </span>
                </td>
                <td className={`whitespace-nowrap px-6 py-4 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-900"}`}>
                  {formatPostDate(post.createdAt)}
                </td>
                <td className={`whitespace-nowrap px-6 py-4 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-900"}`}>
                  {post.likes?.length || 0}
                </td>
                <td className={`whitespace-nowrap px-6 py-4 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-900"}`}>
                  {post.comments?.length || 0}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                No posts found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PostTable;
