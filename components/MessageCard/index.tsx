import React from "react";
import { MdDownload } from "react-icons/md";
import image from "../../assets/book1.png";

export default function MessageCard({
  message,
  hideImage,
  audio,
}: {
  message: Message;
  hideImage?: boolean;
  audio?: string;
}) {
  const _image = message?.imageUrl?.fields?.file?.url ?? image.src;
  return (
    <div className="overflow-hidden w-[200px] rounded-xl">
      <div className=" text-primary  bg-white  w-[200px]  rounded-xl border-1 border-primary p-3 shadow-lg mb-5">
        {!hideImage && (
          <div
            // style={{ aspectRatio: "auto" }}
            className="shadow-2xl rounded-lg mb-5 w-full h-[150px] flex justify-center items-center overflow-hidden"
          >
            <img src={_image} alt={message.title} width={200} />
          </div>
        )}
        <div className="text-sm">
          {message.title}
          <br />
        </div>
        <div className="flex justify-between items-center">
          <small className="opacity-50 text-xs">Pst {message.preacher}</small>
          <button className="flex gap-3">
            {/* <MdOutlineMonitorHeart /> */}
            <a
              href={`${audio ?? message?.audio?.fields?.file?.url}`}
              download={message.title}
              className="hover:opacity-80"
            >
              {/* Download audio file */}
              <MdDownload size={30} />
            </a>
          </button>
        </div>
      </div>
    </div>
  );
}
