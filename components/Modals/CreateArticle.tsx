import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import UploadWidget from "../UploadWidget,tsx";

interface PoemForm {
  title: string;
  content: string;
  image: string;
  scripture: string;
}

export default function CreatePoem({
  showModal,
  onCancel,
}: {
  showModal: boolean;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<PoemForm>({
    content: "",
    image: "",
    title: "",
    scripture: "",
  });

  const handleSubmit = async () => {
    try {
    } catch (error) {
    } finally {
    }
  };

  if (!showModal) {
    return <></>;
  }

  return (
    <div
      className="relative z-10"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"></div>
        </div>
      </div>
    </div>
  );
}
