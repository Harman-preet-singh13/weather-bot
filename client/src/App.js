import React, { useState, useEffect } from "react";
import { UserAuth } from "./context/AuthContext";
import UserTable from "./components/UserTable";
import "./App.css";

export default function App() {
  const [loading, setLoading] = useState(true);
  const { user, googleSignIn, logOut } = UserAuth();

  const handleSignIn = async () => {
    try {
      await googleSignIn();
    } catch (error) {
      console.log(error);
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const checkAuthentication = async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      setLoading(false);
    };
    checkAuthentication();
  }, [user]);

  const listStyle =
    "mt-2 cursor-pointer px-2 py-1 hover:bg-blue-600 hover:text-white rounded-md";

  return (
    <div className="container">
      {loading ? null : !user ? (
        <div className="h-screen flex justify-center items-center">
          <button 
          onClick={handleSignIn}
          className="px-4 py-2 text-xl rounded-md font-semibold border border-blue-600 hover:text-white hover:bg-blue-600">
            Login
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-between">
            <p className="mt-2 cursor-pointer px-2 py-1">
              Welcome,{" "}
              <span className="font-semibold ">{user.displayName}</span>
            </p>
            <p className={`${listStyle} mr-2 font-semibold text-center border border-blue-600`} onClick={handleSignOut}>
              Sign out
            </p>
          </div>
          <UserTable />
        </>
      )}
    </div>
  );
}
