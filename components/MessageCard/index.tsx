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
    <div className="overflow-hidden rounded-xl group cursor-pointer">
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        {!hideImage && (
          <div className="relative h-64 w-full overflow-hidden">
            <Link href={`/messages/${message.title}`}>
              <img
                src={_image}
                alt={message.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </Link>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Download and Share buttons overlay */}
            <div className="absolute top-4 right-4 flex items-center gap-2">

            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                <Share
                  iconColor="white"
                  icon
                  hideIconText
                  title={message.title}
                  shareUrl={`https://eemodiae.org/messages/${message.title}`}
                />
              </div>

              <a
                href={`${audio ?? message?.audio?.fields?.file?.url}`}
                download={message.title}
                className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                onClick={() =>
                  window && window.open(message?.audio?.fields?.file?.url)
                }
              >
                <MdDownload size={16} />
              </a>
              {/* <Share
                iconColor="white"
                icon
                hideIconText
                title={message.title}
                shareUrl={`https://eemodiae.org/messages/${message.title}`}
              />
              <a
                href={`${audio ?? message?.audio?.fields?.file?.url}`}
                download={message.title}
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                onClick={() =>
                  window && window.open(message?.audio?.fields?.file?.url)
                }
              >
                <MdDownload size={16} />
              </a> */}
            </div>
          </div>
        )}

        {/* Lower content section */}
        <div className="p-6">
          <Link href={`/messages/${message.title}`}>
            <h3 className="text-lg font-semibold mb-2 line-clamp-2 text-gray-800 group-hover:text-primary transition-colors">
              {message.title}
            </h3>
          </Link>
          <div className="flex justify-between items-center">
            <small className="text-gray-600 text-sm">
              Pst {message.preacher || "Emmanuel I. Emodiae"}
            </small>
            {/* <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                <Share
                  iconColor="white"
                  icon
                  hideIconText
                  title={message.title}
                  shareUrl={`https://eemodiae.org/messages/${message.title}`}
                />
              </div>

              <a
                href={`${audio ?? message?.audio?.fields?.file?.url}`}
                download={message.title}
                className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                onClick={() =>
                  window && window.open(message?.audio?.fields?.file?.url)
                }
              >
                <MdDownload size={16} />
              </a>
            </div> */}
          </div>
        </div>

        {/* Fallback content for when image is hidden */}
        {hideImage && (
          <div className="p-6">
            <Link href={`/messages/${message.title}`}>
              <h3 className="text-lg font-semibold mb-2 line-clamp-2 text-gray-800">
                {message.title}
              </h3>
            </Link>
            <div className="flex justify-between items-center">
              <small className="text-gray-600 text-sm">
                Pst {message.preacher || "Emmanuel I. Emodiae"}
              </small>
              <div className="flex gap-3 items-center">
                <Share
                  icon
                  title={message.title}
                  shareUrl={`https://eemodiae.org/messages/${message.title}`}
                />
                <a
                  href={`${audio ?? message?.audio?.fields?.file?.url}`}
                  download={message.title}
                  className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                  onClick={() =>
                    window && window.open(message?.audio?.fields?.file?.url)
                  }
                >
                  <MdDownload size={16} />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
