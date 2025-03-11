import { useEffect } from "react";
import UserPost from "../components/UserPost";
import { useAuth } from "../contexts/AuthProvider";
import { usePosts } from "../contexts/PostsProvider";
import { useState } from "react";
import { useTheme } from "../contexts/ThemeProvider";

export default function Bookmarks() {
  const {
    userData: {
      user: { userDetails },
    },
  } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const {
    postsData: { posts },
  } = usePosts();

  const getUserBookmarks = (bookmarkIdsArr, posts) => {
    if (!bookmarkIdsArr || !posts) {
      setBookmarks([]);
      return;
    }
    
    const bookmarkedPosts = bookmarkIdsArr
      .map(bookmarkId => posts.find(post => post._id === bookmarkId))
      .filter(post => post !== undefined); // Remove any undefined posts
    
    setBookmarks(bookmarkedPosts);
    setLoading(false);
  };

  useEffect(() => {
    if (userDetails && posts) {
      getUserBookmarks(userDetails.bookmarks || [], posts);
    }
  }, [posts, userDetails]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <section className="w-full max-w-[500px] py-2">
      <h1 className={`text-2xl font-bold mb-4 ${theme === "dark" ? "text-gray-200" : "text-gray-800"}`}>
        Bookmarks
      </h1>
      {bookmarks.length > 0 ? (
        <section className="flex flex-col gap-2">
          {bookmarks.map((post) => (
            <UserPost key={post._id} userPost={post} />
          ))}
        </section>
      ) : (
        <div className={`grid min-h-[100px] place-items-center ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
          <h4>No bookmarks yet</h4>
        </div>
      )}
    </section>
  );
}
