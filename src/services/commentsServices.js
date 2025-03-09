import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

// /api/comments/:postId
export const getPostCommentsService = (postId) => {
  return axios.get(`/api/comments/${postId}`);
};

// /api/comments/add/:postId
export const addPostCommentService = (postId, inputText, token) => {
  return axios.post(
    `${API_URL}/api/post/comment/${postId}`,
    {
      commentData: {
        content: inputText,
      },
    },
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );
};

// /api/comments/edit/:postId/:commentId
export const editPostCommentService = (postId, commentId, inputText, token) => {
  return axios.post(
    `/api/comments/edit/${postId}/${commentId}`,
    {
      commentData: {
        content: inputText,
      },
    },
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );
};

// /api/comments/delete/:postId/:commentId
export const deletePostCommentService = (postId, commentId, token) => {
  return axios.delete(`${API_URL}/api/post/comment/${postId}?commentId=${commentId}`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
};

// /api/comments/like/:postId/:commentId
export const likePostCommentService = (postId, commentId, token) => {
  return axios.post(
    `/api/comments/like/${postId}/${commentId}`,
    {},
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );
};

// /api/comments/dislike/:postId/:commentId
export const dislikePostCommentService = (postId, commentId, token) => {
  return axios.post(
    `/api/comments/dislike/${postId}/${commentId}`,
    {},
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );
};
