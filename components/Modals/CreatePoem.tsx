import React, { useState } from "react";
// import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import UploadWidget from "../UploadWidget,tsx";
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
});

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
              <div className="sm:col-span-4">
                <label
                  htmlFor="content"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Content
                </label>
                <div className="mt-2">
                  <ReactQuill
                    style={{ color: "#333" }}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, content: e }))
                    }
                  />
                </div>
              </div>
              <div className="sm:col-span-4">
                <label
                  htmlFor="content"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Scripture
                </label>
                <div className="mt-2">
                  <ReactQuill
                    style={{ color: "#333" }}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, scripture: e }))
                    }
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

              {/* <label
                htmlFor="cover-photo"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Image
              </label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                <div className="text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-300"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <div className="mt-4 flex text-sm leading-6 text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs leading-5 text-gray-600">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div> */}
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
