import React, { useEffect, useState } from "react";
import axios from "../utils/axios";
import { toast } from "react-hot-toast";

const PostTable = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get("/api/admin/posts");
        setPosts(response.data);
      } catch (error) {
        console.error("Error fetching posts:", error);
        toast.error("Failed to fetch posts");
      }
    };

    fetchPosts();
  }, []);

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            Post ID
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            Content
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            Creator
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            Likes
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            Comments
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 bg-white">
        {posts.map((post) => (
          <tr key={post._id}>
            <td className="whitespace-nowrap px-6 py-4">{post._id}</td>
            <td className="max-w-xs truncate whitespace-nowrap px-6 py-4">
              {post.content}
            </td>
            <td className="whitespace-nowrap px-6 py-4">
              {post.creator?.username}
            </td>
            <td className="whitespace-nowrap px-6 py-4">
              {post.likes?.length || 0}
            </td>
            <td className="whitespace-nowrap px-6 py-4">
              {post.comments?.length || 0}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PostTable;
