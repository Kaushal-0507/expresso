// // import { Server, Model, RestSerializer } from "miragejs";
// // import { posts } from "./backend/db/posts";
// // import { users } from "./backend/db/users";
// // import {
// //   loginHandler,
// //   signupHandler,
// // } from "./backend/controllers/AuthController";
// // import {
// //   createPostHandler,
// //   getAllpostsHandler,
// //   getPostHandler,
// //   deletePostHandler,
// //   editPostHandler,
// //   likePostHandler,
// //   dislikePostHandler,
// //   // getAllUserPostsHandler,
// // } from "./backend/controllers/PostController";
// // import {
// //   followUserHandler,
// //   getAllUsersHandler,
// //   getUserHandler,
// //   getBookmarkPostsHandler,
// //   bookmarkPostHandler,
// //   removePostFromBookmarkHandler,
// //   unfollowUserHandler,
// //   editUserHandler,
// // } from "./backend/controllers/UserController";
// // import {
// //   addPostCommentHandler,
// //   deletePostCommentHandler,
// //   dislikePostCommentHandler,
// //   editPostCommentHandler,
// //   getPostCommentsHandler,
// //   likePostCommentHandler,
// // } from "./backend/controllers/CommentsController";
// // import { CLOUDINARY_URL } from "./common/uploadMedia";
// import {
//   loginHandler,
//   signupHandler,
// } from "./backend/controllers/AuthController";
// import {
//   createPostHandler,
//   getAllpostsHandler,
//   getPostHandler,
//   deletePostHandler,
//   editPostHandler,
//   likePostHandler,
//   dislikePostHandler,
//   getAllUserPostsHandler,
// } from "./backend/controllers/PostController";
// import {
//   followUserHandler,
//   getAllUsersHandler,
//   getUserHandler,
//   getBookmarkPostsHandler,
//   bookmarkPostHandler,
//   removePostFromBookmarkHandler,
//   unfollowUserHandler,
//   editUserHandler,
// } from "./backend/controllers/UserController";
// import {
//   addPostCommentHandler,
//   deletePostCommentHandler,
//   dislikePostCommentHandler,
//   editPostCommentHandler,
//   getPostCommentsHandler,
//   likePostCommentHandler,
// } from "./backend/controllers/CommentsController";

// // Auth routes
// app.post("/api/auth/signup", signupHandler);
// app.post("/api/auth/login", loginHandler);

// // Post routes
// app.get("/api/posts", getAllpostsHandler);
// app.get("/api/posts/:postId", getPostHandler);
// app.get("/api/posts/user/:username", getAllUserPostsHandler);
// app.post("/api/posts", createPostHandler);
// app.delete("/api/posts/:postId", deletePostHandler);
// app.post("/api/posts/edit/:postId", editPostHandler);
// app.post("/api/posts/like/:postId", likePostHandler);
// app.post("/api/posts/dislike/:postId", dislikePostHandler);

// // User routes
// app.get("/api/users", getAllUsersHandler);
// app.get("/api/users/:userId", getUserHandler);
// app.post("/api/users/edit", editUserHandler);
// app.get("/api/users/bookmark", getBookmarkPostsHandler);
// app.post("/api/users/bookmark/:postId", bookmarkPostHandler);
// app.post("/api/users/remove-bookmark/:postId", removePostFromBookmarkHandler);
// app.post("/api/users/follow/:followUserId", followUserHandler);
// app.post("/api/users/unfollow/:followUserId", unfollowUserHandler);

// // Comment routes
// app.get("/api/comments/:postId", getPostCommentsHandler);
// app.post("/api/comments/add/:postId", addPostCommentHandler);
// app.post("/api/comments/like/:postId/:commentId", likePostCommentHandler);
// app.post("/api/comments/dislike/:postId/:commentId", dislikePostCommentHandler);
// app.post("/api/comments/edit/:postId/:commentId", editPostCommentHandler);
// app.delete("/api/comments/delete/:postId/:commentId", deletePostCommentHandler);

// // export function makeServer({ environment = "development" } = {}) {
//   return new Server({
//     serializers: {
//       application: RestSerializer,
//     },
//     environment,
//     // TODO: Use Relationships to have named relational Data
//     models: {
//       post: Model,
//       user: Model,
//     },

//     // Runs on the start of the server
//     seeds(server) {
//       server.logging = false;
//       users.forEach((item) =>
//         server.create("user", {
//           ...item,
//           followers: [],
//           following: [],
//           bookmarks: [],
//         })
//       );
//       posts.forEach((item) => server.create("post", { ...item }));
//     },

//     routes() {
//       this.namespace = "api";
//       // auth routes (public)
//       this.post("/auth/signup", signupHandler.bind(this));
//       this.post("/auth/login", loginHandler.bind(this));

//       // post routes (public)
//       this.get("/posts", getAllpostsHandler.bind(this));
//       this.get("/posts/:postId", getPostHandler.bind(this));
//       this.get("/posts/user/:username", getAllUserPostsHandler.bind(this));

//       // post routes (private)
//       this.post("/posts", createPostHandler.bind(this));
//       this.delete("/posts/:postId", deletePostHandler.bind(this));
//       this.post("/posts/edit/:postId", editPostHandler.bind(this));
//       this.post("/posts/like/:postId", likePostHandler.bind(this));
//       this.post("/posts/dislike/:postId", dislikePostHandler.bind(this));

//       // user routes (public)
//       this.get("/users", getAllUsersHandler.bind(this));
//       this.get("/users/:userId", getUserHandler.bind(this));

//       // user routes (private)
//       this.post("users/edit", editUserHandler.bind(this));
//       this.get("/users/bookmark", getBookmarkPostsHandler.bind(this));
//       this.post("/users/bookmark/:postId/", bookmarkPostHandler.bind(this));
//       this.post(
//         "/users/remove-bookmark/:postId/",
//         removePostFromBookmarkHandler.bind(this)
//       );
//       this.post("/users/follow/:followUserId/", followUserHandler.bind(this));
//       this.post(
//         "/users/unfollow/:followUserId/",
//         unfollowUserHandler.bind(this)
//       );

//       //comments rountes
//       this.get("/comments/:postId", getPostCommentsHandler.bind(this));
//       this.post("/comments/add/:postId", addPostCommentHandler.bind(this));
//       this.post(
//         "/comments/like/:postId/:commentId",
//         likePostCommentHandler.bind(this)
//       );
//       this.post(
//         "/comments/dislike/:postId/:commentId",
//         dislikePostCommentHandler.bind(this)
//       );
//       this.post(
//         "/comments/edit/:postId/:commentId",
//         editPostCommentHandler.bind(this)
//       );
//       this.delete(
//         "/comments/delete/:postId/:commentId",
//         deletePostCommentHandler.bind(this)
//       );

//       this.passthrough(CLOUDINARY_URL);
//     },
//   });
// }
