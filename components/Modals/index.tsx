import React from "react";
import "react-quill/dist/quill.snow.css";

export default function Modal({
  showModal,
  onCancel,
  children,
}: {
  showModal: boolean;
  onCancel: () => void;
  children: any;
}) {
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
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-lg"></div>

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto ">
        <div className="flex mt-20 min-h-full items-end justify-center p-4  text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
