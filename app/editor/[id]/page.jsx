"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "../../_context/AuthContext";
import { useSocket } from "../../_context/SocketContext";
import api from "../../_lib/api";
import PresenceIndicator from "../../_components/PresenceIndicator";
import ShareModal from "../../_components/ShareModal";
import { debounce } from "../../_lib/debounce";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

export default function DocumentEditorPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, users } = useAuth(); // Assuming users data is available in AuthContext
  const socket = useSocket();

  // State management
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeUsers, setActiveUsers] = useState([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [remoteCursors, setRemoteCursors] = useState({});
  const editorRef = useRef(null);

  // Ensure socket connection
  useEffect(() => {
    if (socket && !socket.connected) {
      socket.connect();
    }
  }, [socket]);

  // Jodit editor configuration
  const config = {
    readonly: false,
    toolbar: true,
    spellcheck: true,
    buttons: ["bold", "italic", "link", "unlink", "underline", "source"],
    observer: {
      timeout: 100,
    },
    events: {
      afterInit: (instance) => {
        editorRef.current = instance;
      },
      cursorAfter: (position) => {
        if (socket?.connected && editorRef.current && id !== "new") {
          const cursorPos = editorRef.current.selection.getCursorPosition();
          socket.emit("cursor-update", {
            documentId: id,
            userId: user.id,
            position: cursorPos,
          });
        }
      },
    },
  };

  // Fetch document data
  const fetchDocument = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/documents/${id}`);
      setContent(response.data.data.document.content);
      setTitle(response.data.data.document.title);
    } catch (err) {
      console.error("Failed to fetch doc", err, err.response?.data);
      setError("Failed to load document");
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  // Initialize document
  useEffect(() => {
    if (id !== "new") {
      fetchDocument();
    } else {
      setIsLoading(false);
      setTitle("Untitled Document");
    }
  }, [id, fetchDocument]);

  // Socket.IO event handlers
  useEffect(() => {
    if (!socket || !user || id === "new") return;

    const handleTextUpdate = ({ content: newContent }) => {
      setContent(newContent);
    };

    const handleUserJoined = (userId) => {
      setActiveUsers((prev) => [...prev, userId]);
    };

    const handleUserPresence = ({ userId, isActive }) => {
      setActiveUsers((prev) =>
        isActive
          ? [...prev.filter((id) => id !== userId), userId]
          : prev.filter((id) => id !== userId)
      );
    };

    const handleCursorUpdate = ({ userId, position }) => {
      setRemoteCursors((prev) => ({
        ...prev,
        [userId]: position,
      }));
    };

    // Join document room
    socket.emit("join-document", { documentId: id, userId: user.id });

    // Set up event listeners
    socket.on("text-update", handleTextUpdate);
    socket.on("user-joined", handleUserJoined);
    socket.on("user-presence-update", handleUserPresence);
    socket.on("cursor-update", handleCursorUpdate);

    // Presence heartbeat
    const interval = setInterval(() => {
      socket.emit("user-presence", {
        documentId: id,
        userId: user.id,
        isActive: true,
      });
    }, 5000);

    // Cleanup
    return () => {
      socket.off("text-update", handleTextUpdate);
      socket.off("user-joined", handleUserJoined);
      socket.off("user-presence-update", handleUserPresence);
      socket.off("cursor-update", handleCursorUpdate);
      clearInterval(interval);
      socket.emit("leave-document", { documentId: id, userId: user.id });
    };
  }, [socket, id, user]);

  // Debounced content change handler
  const handleContentChange = useCallback(
    debounce((newContent) => {
      setContent(newContent);
      if (id !== "new" && socket?.connected) {
        // Save to database
        api
          .patch(`/documents/${id}`, { content: newContent })
          .catch(console.error);

        // Broadcast changes
        socket.emit("text-change", {
          documentId: id,
          userId: user.id,
          content: newContent,
        });
      }
    }, 500),
    [id, socket, user?.id]
  );

  // Editor change handler with cursor tracking
  const handleEditorChange = (newContent) => {
    handleContentChange(newContent);
  };

  // Title change handler
  const handleTitleChange = async (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (id !== "new") {
      await api.patch(`/documents/${id}`, { title: newTitle });
    }
  };

  // New document save handler
  const handleSaveNewDocument = async () => {
    try {
      setIsLoading(true);
      const response = await api.post("/documents", { title, content });
      router.push(`/editor/${response.data.document._id}`);
    } catch (err) {
      setError("Failed to save document");
    } finally {
      setIsLoading(false);
    }
  };

  // Document share handler
  const handleShareDocument = async (email, permission) => {
    try {
      await api.post(`/documents/${id}/share`, { email, permission });
    } catch (err) {
      setError("Failed to share document");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="border-b p-4 flex justify-between items-center">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          className="text-xl font-semibold border-none focus:outline-none"
        />
        <div className="flex items-center gap-4">
          <PresenceIndicator
            activeUsers={activeUsers}
            currentUserId={user?.id}
          
          />
          {id !== "new" ? (
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Share
            </button>
          ) : (
            <button
              onClick={handleSaveNewDocument}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              Save
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 relative">
        <JoditEditor
          value={content}
          config={config}
          onBlur={handleEditorChange}
          onChange={handleEditorChange}
        />

        {/* Render remote cursors */}
        {Object.entries(remoteCursors).map(([userId, position]) => {
          if (userId === user?.id) return null;
          const userData = users?.find((u) => u._id === userId);

          return (
            <div
              key={userId}
              className="absolute h-6 w-0.5 bg-blue-500"
              style={{
                left: `${position}px`,
                top: "10px",
              }}
            >
              <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                {userData?.name || "Anonymous"}
              </div>
            </div>
          );
        })}
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onShare={handleShareDocument}
      />
    </div>
  );
}
