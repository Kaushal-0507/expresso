import axios from "axios";
import { v4 as uuid } from "uuid";
const API_URL = import.meta.env.VITE_API_URL;

const getHeaders = (token) => ({
  headers: {
    authorization: `Bearer ${token}`,
  },
})

export const getAllPostsService = () => {
  return axios.get(`${API_URL}/api/post/all`);
};

export const getSinglePostService = (postId, token) => {
  return axios.get(`${API_URL}/api/post/single/${postId}`, getHeaders(token));
};

export const getUserPostsService = (userId, token) => {
  return axios.get(`${API_URL}/api/post/${userId}`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
};

export const likePostService = (postId, token) => {
  return axios.post(
    `${API_URL}/api/post/like/${postId}`,
    {},
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );
};

export const dislikePostService = (postId) => {
  return axios.post(
    `${API_URL}/api/post/like/${postId}`,
    {},
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );
};

// /api/posts/
export const createPostService = (postData, token) => {
  return axios.post(
    `${API_URL}/api/post/new`,
    postData, // Send postData directly
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );
};

// /api/posts/edit/:postId
export const editPostService = (postData, postId, token) => {
  return axios.put(
    `${API_URL}/api/post/${postId}`,
    {
      ...postData,
    },
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );
};

// /api/posts/:postId
export const deletePostService = (postId, token) => {
  return axios.delete(`${API_URL}/api/post/${postId}`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
};
