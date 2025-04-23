import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthProvider";
import { useUsers } from "../contexts/UsersProvider";
import { useTheme } from "../contexts/ThemeProvider";
import io from "socket.io-client";
import Avatar from "../components/Avatar";
import { toast } from "react-hot-toast";

export default function Chat() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const { theme } = useTheme();

  const {
    userData: {
      user: { userDetails, token },
    },
  } = useAuth();

  const {
    usersData: { users },
  } = useUsers();

  console.log("Current user details:", userDetails); // Debug log for current user
  console.log("All users:", users); // Debug log for all users

  // Filter users who mutually follow each other
  const mutualFollowers = users?.filter((user) => {
    const isCurrentUserFollowingThem = userDetails?.followings?.includes(
      user._id
    );
    const areTheyFollowingCurrentUser = user.followings?.includes(
      userDetails?._id
    );

    console.log(`Checking user ${user.username}:`, {
      userId: user._id,
      isCurrentUserFollowingThem,
      areTheyFollowingCurrentUser,
    });

    return (
      user._id !== userDetails?._id && // Not the current user
      isCurrentUserFollowingThem && // Current user follows them
      areTheyFollowingCurrentUser
    ); // They follow current user
  });

  console.log("Mutual followers:", mutualFollowers);

  // Filter users based on search query
  const filteredUsers = searchQuery
    ? mutualFollowers?.filter(
        (user) =>
          user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mutualFollowers;

  // Socket connection effect
  useEffect(() => {
    if (!token) {
      console.log("No token available for socket connection");
      return;
    }

    console.log("Attempting socket connection with token:", token);
    const newSocket = io("http://localhost:7000", {
      auth: {
        token: `Bearer ${token}`, // Add Bearer prefix
      },
      transports: ["websocket"],
      withCredentials: true,
    });

    // Handle connection
    newSocket.on("connect", () => {
      console.log("Connected to chat server successfully");
    });

    // Handle connection errors
    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error details:", {
        message: error.message,
        description: error.description,
        data: error.data,
      });
      if (error.message === "Authentication error") {
        toast.error("Chat authentication failed. Please try logging in again.");
      }
    });

    // Handle online users
    newSocket.on("onlineUsers", (users) => {
      console.log("Online users:", users);
      setOnlineUsers(new Set(users));
    });

    // Handle chat history
    newSocket.on("chatHistory", (history) => {
      console.log("Received chat history:", history);
      if (!history) {
        console.warn("Received empty chat history");
        setMessages([]);
        return;
      }

      // Ensure all messages have valid timestamps and sender/receiver info
      const validMessages = history.filter(msg => {
        return msg && 
               msg.content && 
               msg.sender && 
               msg.receiver && 
               msg.timestamp;
      }).map(msg => ({
        ...msg,
        timestamp: msg.timestamp || new Date().toISOString()
      }));

      console.log("Processed messages:", validMessages.length);
      setMessages(validMessages);
    });

    // Handle new messages
    newSocket.on("newMessage", (message) => {
      console.log("Received new message:", message);
      if (!message || !message.content || !message.sender || !message.receiver) {
        console.warn("Received invalid message:", message);
        return;
      }

      setMessages((prevMessages) => {
        // Check if message already exists to prevent duplicates
        const messageExists = prevMessages.some(
          (msg) =>
            msg._id === message._id ||
            (msg.sender._id === message.sender._id &&
              msg.receiver._id === message.receiver._id &&
              msg.content === message.content &&
              Math.abs(new Date(msg.timestamp) - new Date(message.timestamp)) < 1000)
        );

        if (messageExists) {
          return prevMessages;
        }

        // Ensure the new message has a valid timestamp
        const newMessage = {
          ...message,
          timestamp: message.timestamp || new Date().toISOString()
        };

        return [...prevMessages, newMessage];
      });
    });

    // Handle errors
    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
      if (error.message === "Failed to fetch chat history") {
        console.log("Attempting to retry fetching chat history...");
        // Retry fetching chat history after a short delay
        setTimeout(() => {
          if (selectedUser) {
            socket.emit("getChatHistory", selectedUser._id);
          }
        }, 1000);
      }
      toast.error(error.message || "Chat error occurred");
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.off("connect");
        newSocket.off("connect_error");
        newSocket.off("onlineUsers");
        newSocket.off("chatHistory");
        newSocket.off("newMessage");
        newSocket.off("error");
        newSocket.disconnect();
      }
    };
  }, [token]); // Add token as dependency

  // Load chat history when selecting a user
  useEffect(() => {
    if (selectedUser && socket) {
      // Clear previous messages when changing users
      setMessages([]);

      // Join the chat room and get history
      socket.emit("joinChat", selectedUser._id);
      socket.emit("getChatHistory", selectedUser._id);
    }
  }, [selectedUser, socket]); // Add socket as dependency

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim() && selectedUser && socket) {
      const messageData = {
        _id: Date.now().toString(), // Temporary ID for immediate display
        sender: userDetails._id,
        receiver: selectedUser._id,
        content: messageInput.trim(),
        timestamp: new Date().toISOString(),
      };

      // Add message to state immediately
      setMessages((prev) => [...prev, messageData]);

      // Send message to server
      socket.emit("sendMessage", messageData);
      setMessageInput("");
    }
  };

  // Handle new messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      console.log("Received new message:", message);
      setMessages((prevMessages) => {
        // Only check for exact duplicate by ID
        if (prevMessages.some((msg) => msg._id === message._id)) {
          return prevMessages;
        }
        return [...prevMessages, message];
      });
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket]);

  // Handle chat history
  useEffect(() => {
    if (!socket) return;

    const handleChatHistory = (history) => {
      console.log("Received chat history:", history);
      setMessages(history || []);
    };

    socket.on("chatHistory", handleChatHistory);

    return () => {
      socket.off("chatHistory", handleChatHistory);
    };
  }, [socket]);

  return (
    <div
      className={`flex h-[calc(100vh-120px)] ${
        theme === "dark" ? "bg-mineShaftDark text-white" : "bg-white"
      }`}
    >
      {/* Chat Area */}
      <div className="flex flex-[2] flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div
              className={`border-b p-4 ${
                theme === "dark" ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="flex items-center">
                <div className="relative">
                  <Avatar profileUrl={selectedUser.profileImg} />
                  {onlineUsers.has(selectedUser._id) && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />
                  )}
                </div>
                <div className="ml-3">
                  <p className="font-medium">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </p>
                  <p className="text-sm text-gray-500">
                    @{selectedUser.username}
                    {onlineUsers.has(selectedUser._id) && (
                      <span className="ml-2 text-green-500">● Online</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-4 flex ${
                    message.sender._id === userDetails._id
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.sender._id === userDetails._id
                        ? theme === "dark"
                          ? "bg-blue-600"
                          : "bg-blue-500 text-white"
                        : theme === "dark"
                        ? "bg-mineShaft"
                        : "bg-gray-100"
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className="mt-1 text-xs opacity-70">
                      {message.timestamp
                        ? new Date(message.timestamp).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            }
                          )
                        : "Just now"}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form
              onSubmit={sendMessage}
              className={`border-t p-4 ${
                theme === "dark" ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  className={`flex-1 rounded-lg p-2 ${
                    theme === "dark"
                      ? "bg-mineShaft text-white placeholder-gray-400"
                      : "bg-gray-100 text-gray-900 placeholder-gray-500"
                  }`}
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className={`rounded-lg px-4 py-2 ${
                    theme === "dark"
                      ? "bg-blue-600 text-white disabled:bg-gray-700"
                      : "bg-blue-500 text-white disabled:bg-gray-300"
                  }`}
                >
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-gray-500">Select a user to start chatting</p>
          </div>
        )}
      </div>

      {/* Users List */}
      <div
        className={`w-[300px] border-l ${
          theme === "dark" ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <div className="p-4">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full rounded-lg p-2 ${
              theme === "dark"
                ? "bg-mineShaft text-white placeholder-gray-400"
                : "bg-gray-100 text-gray-900 placeholder-gray-500"
            }`}
          />
        </div>
        <div className="h-full overflow-y-auto">
          {filteredUsers?.map((user) => (
            <div
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`flex cursor-pointer items-center p-4 ${
                selectedUser?._id === user._id
                  ? theme === "dark"
                    ? "bg-mineShaft"
                    : "bg-gray-100"
                  : ""
              } hover:bg-opacity-80`}
            >
              <div className="relative">
                <Avatar profileUrl={user.profileImg} />
                {onlineUsers.has(user._id) && (
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />
                )}
              </div>
              <div className="ml-3">
                <p className="font-medium">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-gray-500">@{user.username}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
