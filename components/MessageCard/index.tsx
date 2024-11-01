"use client";
import Link from "next/link";
import React from "react";
import { MdDownload } from "react-icons/md";
import image from "../../assets/book1.png";
import Share from "../Share";

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
            className="relative shadow-2xl rounded-lg mb-5 w-full h-[150px] flex justify-center items-center overflow-hidden"
          >
            <Link href={`/messages/${message.title}`}>
              <img src={_image} alt={message.title} width={200} />
            </Link>
            <div className="gradient-overlay absolute bottom-0 w-full p-2 flex justify-end items-center gap-3">
              <Share
                iconColor="white"
                icon
                title={message.title}
                shareUrl={`https://eemodie.org/messages/${message.title}`}
              />

              <button className="flex gap-3 ">
                {/* <MdOutlineMonitorHeart /> */}
                <a
                  href={`${audio ?? message?.audio?.fields?.file?.url}`}
                  download={message.title}
                  className="hover:opacity-80"
                  onClick={() =>
                    window && window.open(message?.audio?.fields?.file?.url)
                  }
                >
                  <MdDownload color="white" size={20} />
                </a>
              </button>
            </div>
          </div>
        )}
        <div className="text-sm">
          {message.title}
          <br />
        </div>
        <div className="flex justify-between items-center">
          <small className="opacity-50 text-[12px]">
            Pst {message.preacher || "Emmanuel I. Emodiae"}
          </small>
          {hideImage && (
            <button className="flex gap-3 items-center">
              <Share
                // iconColor="white"
                icon
                title={message.title}
                shareUrl={`https://eemodie.org/messages/${message.title}`}
              />
              <a
                href={`${audio ?? message?.audio?.fields?.file?.url}`}
                download={message.title}
                className="hover:opacity-80"
                onClick={() =>
                  window && window.open(message?.audio?.fields?.file?.url)
                }
              >
                {/* Download audio file */}
                <MdDownload size={30} />
              </a>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
