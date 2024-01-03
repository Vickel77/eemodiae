"use client";

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import useScript from "../../hooks/useScript";

export default function UploadWidget({
  onSuccess,
  onError,
}: {
  onSuccess: (url: string) => void;
  onError?: (error: ErrorEvent) => void;
}) {
  const cloudinaryRef = useRef<any>();
  const widgetRef = useRef<any>();
  // const { loadScript } = useScript();

  const [image, setImage] = useState();

  useEffect(() => {
    //@ignore window
    // loadScript("https://upload-widget.cloudinary.com/global/all.js");
    cloudinaryRef.current = (window as any).cloudinary;
    widgetRef.current = cloudinaryRef?.current?.createUploadWidget(
      {
        cloudName: "dwgywtak8",
        uploadPreset: "eemodiae",
      },
      function (error: any, result: any) {
        if (error) {
          return onError?.(error);
        }
        onSuccess(result?.info?.files[0].uploadInfo.url);
        setImage(result?.info?.files[0].uploadInfo.url);
        console.log("upload result ", result?.info?.files[0].uploadInfo.url);
      }
    );
  }, []);

  return (
    <div className="flex gap-3">
      <button
        className="inline-flex w-full justify-center rounded-md border-2 border-primary text-primary px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto"
        onClick={() => widgetRef.current.open()}
      >
        Upload Image
      </button>

      <img
        className="cta"
        // height={100}
        height={100}
        src={image!}
        alt=" image"
      />
    </div>
  );
}
