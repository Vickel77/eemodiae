import React from "react";
import { MdClose } from "react-icons/md";
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
  if (!showModal) return <></>;

  return (
    <div
      // onClick={() => setShowModal(false)}
      className="fixed top-0 right-0 bg-[#00000055] w-full h-screen flex flex-col justify-end items-end z-50"
    >
      <div className={styles.modal}>
        <div className="w-full flex  justify-end pr-2 mb-2  ">
          <div
            onClick={() => setShowModal(false)}
            className="rounded-full bg-[#ffffff77] p-2 hover:opacity-50 cursor-pointer"
          >
            <MdClose size={20} color="white" />
          </div>
        </div>
        <div className=" text-primary top-0 text-center left-0 bg-white z-10 w-full p-2 rounded-t-lg ">
          <small>Message series on</small>
          <br />
          <b>{message.title}</b>
        </div>
        <div className="shadow-lg p-10 bg-white max-h-[70vh] min-h-[70vh] overflow-y-auto w-[full] relative  ">
          <div className="grid gap-4 p-4 place-items-center sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {message?.audio_file?.map((_message, idx: number) => (
              <MessageCard
                audio={_message?.fields?.file?.url}
                // hideImage
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
    </div>
  );
}
