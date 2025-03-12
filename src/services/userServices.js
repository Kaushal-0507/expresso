import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

export const getAllUsersService = (token) => {
  return axios.get(`${API_URL}/api/user/all`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
};

export const getSingleUserService = (userId, token) => {
  return axios.get(`${API_URL}/api/user/${userId}`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
};

// /api/users/edit
export const editUserDataService = (userData, token) => {
  console.log("Sending user data update:", userData);
  return axios.put(
    `${API_URL}/api/user/${userData._id || "me"}`,
    userData,
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );
};

// /api/users/bookmark
export const getUserBookmarksService = (token) => {
  return axios.get(`${API_URL}/api/users/bookmark`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
};

// /api/users/bookmark/:postId
export const bookmarkPostService = (postId, token) => {
  return axios.post(
    `${API_URL}/api/user/bookmark/${postId}`,
    {},
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );
};

// /api/users/remove-bookmark/:postId
export const removeBookmarkPostService = (postId, token) => {
  return axios.delete(
    `${API_URL}/api/user/removebookmark/${postId}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );
};

// /api/users/follow/:followUserId
export const followUserService = (followUserId, token) => {
  return axios.post(
    `${API_URL}/api/user/follow/${followUserId}`,
    {},
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );
};

// /api/users/unfollow/:followUserId
export const unfollowUserService = (followUserId, token) => {
  return axios.post(
    `${API_URL}/api/user/follow/${followUserId}`,
    {},
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );
};
