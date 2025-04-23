import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthProvider";
import { useUsers } from "../contexts/UsersProvider";
import { useTheme } from "../contexts/ThemeProvider";
import io from "socket.io-client";
import Avatar from "../components/Avatar";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Chat() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const { theme } = useTheme();
  const navigate = useNavigate();

  const {
    userData: {
      user: { userDetails, token },
    },
    login,
    logout,
  } = useAuth();

  const {
    usersData: { users },
  } = useUsers();

  // Validate private chat token on component mount
  useEffect(() => {
    const validatePrivateChatToken = async () => {
      // Always clear the token and show auth form on mount
      localStorage.removeItem("privateChatToken");
      setIsAuthenticated(false);
      setEmail("");
      setPassword("");
    };

    validatePrivateChatToken();
  }, []);

  // Clear private chat token and form fields when user logs out
  useEffect(() => {
    if (!token) {
      localStorage.removeItem("privateChatToken");
      setIsAuthenticated(false);
      // Clear email and password fields when showing auth form
      setEmail("");
      setPassword("");
    }
  }, [token]);

  // Clear form fields on socket authentication error
  useEffect(() => {
    if (socket) {
      socket.on("connect_error", (error) => {
        if (error.message === "Authentication error") {
          localStorage.removeItem("privateChatToken");
          setIsAuthenticated(false);
          // Clear email and password fields when showing auth form
          setEmail("");
          setPassword("");
          toast.error("Session expired. Please login again.");
        }
      });
    }
  }, [socket]);

  const handlePrivateChatLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:7000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await response.json();
      console.log("Login response:", data); // Debug log

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Extract token from the response
      const token = data.encodedToken;
      
      if (!token) {
        console.error("Token not found in response:", data);
        throw new Error("No token received from server");
      }

      // Store the private chat token in localStorage
      localStorage.setItem("privateChatToken", token);
      
      // Validate the token immediately
      const validateResponse = await fetch("http://localhost:7000/api/auth/validate-token", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!validateResponse.ok) {
        throw new Error("Token validation failed");
      }

      setIsAuthenticated(true);
      toast.success("Private chat access granted");
      
      // Clear the form fields
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Private chat login error:", error);
      localStorage.removeItem("privateChatToken");
      setIsAuthenticated(false);
      toast.error(error.message || "Failed to access private chat");
    } finally {
      setIsLoading(false);
    }
  };

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
  }) || []; // Add fallback for when users is undefined

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
    if (!isAuthenticated) return;

    const privateChatToken = localStorage.getItem("privateChatToken");
    if (!privateChatToken) {
      console.log("No private chat token available");
      return;
    }

    // Ensure token doesn't have 'Bearer ' prefix
    const cleanToken = privateChatToken.startsWith("Bearer ") 
      ? privateChatToken.substring(7) 
      : privateChatToken;

    console.log("Attempting socket connection with private chat token");
    const newSocket = io("http://localhost:7000", {
      auth: {
        token: cleanToken,
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
      console.error("Socket connection error details:", error);
      if (error.message.includes("Authentication error")) {
        // Clear invalid token and reset authentication
        localStorage.removeItem("privateChatToken");
        setIsAuthenticated(false);
        setEmail("");
        setPassword("");
        toast.error("Session expired. Please login again.");
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
  }, [isAuthenticated]); // Add isAuthenticated as dependency

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

  // Handle socket message sending
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

      // Add message to state immediately for optimistic update
      setMessages((prev) => [...prev, messageData]);

      // Send message to server
      socket.emit("sendMessage", messageData, (error) => {
        if (error) {
          console.error("Error sending message:", error);
          // Remove the optimistic update if the message failed to send
          setMessages((prev) => prev.filter(msg => msg._id !== messageData._id));
          toast.error(error.message || "Failed to send message");
        }
      });
      
      setMessageInput("");
    }
  };

  // Handle new messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      console.log("Received new message:", message);
      if (!message || !message.content || !message.sender || !message.receiver) {
        console.warn("Received invalid message:", message);
        return;
      }

      // Ensure sender and receiver are properly populated
      const processedMessage = {
        ...message,
        sender: {
          _id: message.sender._id || message.sender,
          username: message.sender.username,
          firstName: message.sender.firstName,
          lastName: message.sender.lastName
        },
        receiver: {
          _id: message.receiver._id || message.receiver,
          username: message.receiver.username,
          firstName: message.receiver.firstName,
          lastName: message.receiver.lastName
        },
        timestamp: message.timestamp || new Date().toISOString()
      };

      setMessages((prevMessages) => {
        // Check if message already exists to prevent duplicates
        const messageExists = prevMessages.some(
          (msg) =>
            msg._id === processedMessage._id ||
            (msg.sender._id === processedMessage.sender._id &&
              msg.receiver._id === processedMessage.receiver._id &&
              msg.content === processedMessage.content &&
              Math.abs(new Date(msg.timestamp) - new Date(processedMessage.timestamp)) < 1000)
        );

        if (messageExists) {
          return prevMessages;
        }

        return [...prevMessages, processedMessage];
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
      if (!Array.isArray(history)) {
        console.warn("Invalid chat history format:", history);
        return;
      }

      // Process each message in history to ensure proper structure
      const processedHistory = history.map(message => ({
        ...message,
        sender: {
          _id: message.sender._id || message.sender,
          username: message.sender.username,
          firstName: message.sender.firstName,
          lastName: message.sender.lastName
        },
        receiver: {
          _id: message.receiver._id || message.receiver,
          username: message.receiver.username,
          firstName: message.receiver.firstName,
          lastName: message.receiver.lastName
        },
        timestamp: message.timestamp || new Date().toISOString()
      }));

      setMessages(processedHistory);
    };

    socket.on("chatHistory", handleChatHistory);

    return () => {
      socket.off("chatHistory", handleChatHistory);
    };
  }, [socket]);

  // Render messages
  const renderMessages = () => {
    return messages.map((message, index) => {
      // Ensure we have the correct sender ID for comparison
      const senderId = message.sender._id || message.sender;
      const isCurrentUser = senderId === userDetails._id;
      
      return (
        <div
          key={index}
          className={`mb-4 flex ${
            isCurrentUser ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-[70%] rounded-lg p-3 ${
              isCurrentUser
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
                ? new Date(message.timestamp).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                : "Just now"}
            </p>
          </div>
        </div>
      );
    });
  };

  if (!isAuthenticated) {
    return (
      <div className={`flex h-screen items-center justify-center ${
        theme === "dark" ? "bg-mineShaftDark" : "bg-gray-50"
      }`}>
        <div className={`w-full max-w-md p-8 rounded-lg shadow-lg ${
          theme === "dark" ? "bg-mineShaft text-white" : "bg-white"
        }`}>
          <h2 className="text-2xl font-bold mb-6 text-center">Private Chat Access</h2>
          <form 
            onSubmit={handlePrivateChatLogin} 
            className="space-y-4"
            autoComplete="off"
          >
            <div>
              <label htmlFor="private-chat-email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                id="private-chat-email"
                name="private-chat-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="off"
                className={`w-full p-2 rounded-lg border ${
                  theme === "dark"
                    ? "bg-mineShaftDark border-gray-700 text-white"
                    : "bg-white border-gray-300"
                }`}
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label htmlFor="private-chat-password" className="block text-sm font-medium mb-1">
                Password
              </label>
              <input
                type="password"
                id="private-chat-password"
                name="private-chat-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className={`w-full p-2 rounded-lg border ${
                  theme === "dark"
                    ? "bg-mineShaftDark border-gray-700 text-white"
                    : "bg-white border-gray-300"
                }`}
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 px-4 rounded-lg font-medium ${
                theme === "dark"
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              } disabled:opacity-50`}
            >
              {isLoading ? "Authenticating..." : "Access Private Chat"}
            </button>
          </form>
        </div>
      </div>
    );
  }

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
              {renderMessages()}
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
