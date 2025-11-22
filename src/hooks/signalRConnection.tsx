import * as signalR from "@microsoft/signalr";
import React, { createContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "./AuthProvider";
import { hubUrl } from "../app/api";

interface SignalRContextType {
  connection: signalR.HubConnection | null;
}

const SignalRContext = createContext<SignalRContextType>({ connection: null });

export const SignalRProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login state
  const {refresh, userProfile} = useAuth();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [refresh,userProfile]);

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    const token = localStorage.getItem("accessToken");

    if (!token) {
      console.error("JWT token is missing!");
      return;
    }

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
        accessTokenFactory: () => token ?? "",
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    newConnection
      .start()
      .then(() => {
        console.log("SignalR connection established");
        newConnection.on("ReceiveNotification", (data) => {
          console.log("🔔 Received raw notification in SignalRProvider:", data);
        });
      })
      .catch((err) => console.error("SignalR Connection Error:", err));

    setConnection(newConnection);

    return () => {
      if (newConnection) {
        newConnection.stop();
      }
    };
  }, [isLoggedIn]);

  return <SignalRContext.Provider value={{ connection }}>{children}</SignalRContext.Provider>;
};


export { SignalRContext };
