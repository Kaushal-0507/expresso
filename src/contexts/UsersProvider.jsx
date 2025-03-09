import { useContext } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { createContext } from "react";
import { getAllUsersService } from "../services/userServices";
import { useReducer } from "react";
import { usersReducers } from "../reducers/usersReducers";
import { USERS } from "../common/reducerTypes";
import { useAuth } from "./AuthProvider";

const UsersContext = createContext();

const initialUsers = {
  users: [],
};

export default function UsersProvider({ children }) {
  const {
    userData: {
      user: { token },
    },
  } = useAuth();
  const [usersData, usersDispatch] = useReducer(usersReducers, initialUsers);

  const getAllUsers = async () => {
    try {
      const { data } = await getAllUsersService(token);
      usersDispatch({ type: USERS.INITIALISE, payload: data });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getAllUsers();
  }, [token]);

  return (
    <UsersContext.Provider value={{ usersData, usersDispatch }}>
      {children}
    </UsersContext.Provider>
  );
}

export const useUsers = () => useContext(UsersContext);
