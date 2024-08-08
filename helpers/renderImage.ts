import React from "react";

export default function renderImage(imageUrl: any) {
  return imageUrl?.fields?.file?.url + "";
}
