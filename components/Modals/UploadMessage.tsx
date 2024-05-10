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
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:col-span-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Title
                </label>
                <div className="mt-2">
                  <input
                    id="title"
                    name="title"
                    type="title"
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, title: e.target.value }))
                    }
                    // autoComplete="email"
                    className="bg-white block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="w-full text-center mt-5">
                <UploadWidget
                  onSuccess={(url) =>
                    setValues((prev) => ({ ...prev, image: url }))
                  }
                />
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:flex justify-center gap-5 sm:px-6">
              <button
                type="button"
                className="inline-flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto"
              >
                Submit
              </button>
              <button
                onClick={onCancel}
                type="button"
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
