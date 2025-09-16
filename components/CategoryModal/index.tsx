import React, { useEffect } from "react";
import { MdClose, MdPlaylistPlay } from "react-icons/md";
import MessageCard from "../MessageCard";
import styles from "./styles.module.css";

export default function CategoryModal({
  showModal,
  setShowModal,
  message,
}: {
  showModal: boolean;
  setShowModal: any;
  message: Message;
}) {
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowModal(false);
      }
    };

    if (showModal) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [showModal, setShowModal]);

  if (!showModal) return <></>;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setShowModal(false);
        }
      }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm w-full h-screen flex flex-col justify-end items-center z-50"
    >
      <div className={styles.modal}>
        {/* Header Section */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6 rounded-t-2xl relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
            
              <div>
                <p className="text-sm opacity-90 font-medium">Message Series</p>
                <h2 className="text-xl font-bold leading-tight">{message.title}</h2>
              </div>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
            >
              <MdClose size={20} />
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white max-h-[75vh] min-h-[60vh] overflow-y-auto">
          {message?.audio_file?.length > 0 ? (
            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-600 text-sm">
                  {message.audio_file.length} message{message.audio_file.length !== 1 ? 's' : ''} in this series
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {message.audio_file.map((_message, idx: number) => (
                  <MessageCard
                    audio={_message?.fields?.file?.url}
                    message={{
                      ...message,
                      title: _message?.fields?.title!,
                    }}
                    key={idx}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <MdPlaylistPlay size={48} className="mb-4 opacity-50" />
              <p className="text-lg font-medium">No messages in this series</p>
              <p className="text-sm opacity-75">Check back later for new content</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
