import React from "react";
import { MdClose } from "react-icons/md";
import MessageCard from "../MessageCard";
// import { ServiceData } from "./Services";

export default function CategoryModal({
  showModal,
  setShowModal,
  message,
}: {
  showModal: boolean;
  setShowModal: any;
  message: Message;
}) {
  if (!showModal) return <></>;

  // const { icon, title, text } = selectedService;

  return (
    <div
      // onClick={() => setShowModal(false)}
      className="fixed top-0 right-0 bg-[#00000055] w-full h-screen flex justify-center items-center z-50"
    >
      <div className="p-10 bg-white max-h-[70vh] min-h-[70vh] overflow-y-auto md:w-[80%] w-[80%] relative shadow-xl rounded-lg">
        <div
          onClick={() => setShowModal(false)}
          className="w-full flex justify-end p-5 hover:opacity-50 cursor-pointer fixed top-10 right-10"
        >
          <MdClose size={20} color="white" />
        </div>
        <div className="flex flex-wrap justify-between w-full">
          {message?.audio_file?.map((_message, idx: number) => (
            <MessageCard
              audio={_message?.fields?.file?.url}
              hideImage
              message={{
                ...message,
                title: _message?.fields?.title!,
              }}
              key={idx}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
