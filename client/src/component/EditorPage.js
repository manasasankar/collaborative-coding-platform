import React from 'react';
import { useState } from 'react';
import Client from './Client';
import Editor from './Editor';
import { useRef } from 'react';
import {useLocation, useParams} from 'react-router-dom';
import toast from "react-hot-toast";
import { useNavigate } from 'react-router-dom';
import { initSocket } from '../socket';
import { useEffect } from 'react';


const EditorPage = () => {
   const [clients, setClients] = useState([]);
  const socketRef = useRef(null)
  const codeRef = useRef(null);
  const location = useLocation();
  const { roomId } = useParams();
  const navigate = useNavigate();
  // Get roomId and username from location.state
  const { username } = location.state || {};

  useEffect(() => {
    const initSocketConnection = async() => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      const handleErrors = (err) => {
        console.log("Socket Error", err);
        toast.error("Socket connection failed, Try again later");
        navigate("/");
      };

      if (roomId && username) {
        socketRef.current.emit('join', { roomId, username });
      }
      socketRef.current.on('joined', ({ clients, username: joinedUsername, socketId }) => {
        if (joinedUsername !== username) {
          toast.success(`${joinedUsername} joined the room.`);
          console.log(`${joinedUsername} joined`);
          
        }
        setClients(clients);
        socketRef.current.emit("sync-code", {
          code: codeRef.current,
          socketId,
        });
      });
      // listening for disconnected
      socketRef.current.on("disconnected", ({ socketId, username }) => {
        toast.success(`${username} left the room.`);
        console.log(`${username} left`);
        setClients((prev) => {
          return prev.filter((client) => client.socketId !== socketId);
        });
      })
    };
    initSocketConnection();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.off("joined");
        socketRef.current.off("disconnected");
      }
    }
  }, [roomId, username]);

   
 

  if (!location.state) {
    return <navigate to="/" />;
  }

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success(`Room ID is copied`);
    } catch (error) {
      console.log(error);
      toast.error("Unable to copy the room ID");
    }
  };

  const leaveRoom = async () => {
    navigate("/");
  };


  return (
    <div className="container-fluid vh-100">
      <div className="row h-100">
        <div className="col-md-2 bg-dark text-light d-flex flex-column h-100">
          <img
            src="/images/codeDev.png"
            alt="Logo"
            className="img-fluid mx-auto"
            style={{ maxWidth: "50px", marginTop: "10px" }}
          />
          <hr style={{ marginBottom: "-3rem" }} />
          {/* Client list container */}
          <div className="d-flex flex-column flex-grow-1 overflow-auto p-2" style={{ background: '#23272b', borderRadius: '8px', marginTop: '1rem', marginBottom: '1rem', minHeight: '120px' }}>
            <div className="text-center mb-5">
            </div>
            {clients.map((client) => 
                <Client key={client.socketId} username={client.username} />
            )}
          </div>
          <hr />
          {/* Buttons */}
          <div className="mt-auto mb-3">
            <button className="btn btn-success w-100 mb-2" onClick={copyRoomId}>
              Copy Room ID
            </button>
            <button className="btn btn-danger w-100" onClick={leaveRoom}>
              Leave Room
            </button>
          </div>
        </div>
        <div className="col-md-10 text-light d-flex flex-column h-100">
          <Editor socketRef={socketRef} roomId={roomId} onCodeChange={(code) => {
              codeRef.current = code;
            }} />
        </div>
      </div>
    </div>
  );
};

export default EditorPage;