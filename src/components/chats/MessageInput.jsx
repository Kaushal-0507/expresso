import React, { useState } from "react";
import { ChatData } from "../../context/ChatContext";
import toast from "react-hot-toast";
import axios from "axios";

const MessageInput = ({ setMessages, selectedChat }) => {
  const [textMsg, setTextMsg] = useState("");
  const { setChats } = ChatData();

  const handleMessage = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("/api/messages", {
        message: textMsg,
        recieverId: selectedChat.users[0]._id,
      });

      setMessages((message) => [...message, data]);
      setTextMsg("");
      setChats((prev) => {
        const updatedChat = prev.map((chat) => {
          if (chat._id === selectedChat._id) {
            return {
              ...chat,
              latestMessage: {
                text: textMsg,
                sender: data.sender,
              },
            };
          }

          return chat;
        });

        return updatedChat;
      });
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };
  return (
    <div>
      <form onSubmit={handleMessage}>
        <input
          type="text"
          placeholder="enter Message"
          className="w-[80%] rounded-lg border border-gray-300 p-2"
          value={textMsg}
          onChange={(e) => setTextMsg(e.target.value)}
          required
        />
        <button type="submit" className="rounded-lg bg-blue-500 p-2 text-white">
          send
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
