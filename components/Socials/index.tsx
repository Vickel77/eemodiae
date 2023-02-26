import React from "react";
import styled from "styled-components";
import Facebook from "../Icons/Facebook";
import Instagram from "../Icons/Instagram";
import Twitter from "../Icons/Twitter";
import YouTube from "../Icons/YouTube";

const Socials = styled(({ className }) => {
  return (
    <div className={className}>
      <a href="#">
        <Twitter size={30} />
      </a>
      <a href="#">
        <Instagram size={30} />
      </a>
      <a href="#">
        <Facebook size={30} />
      </a>
      <a href="#">
        <YouTube size={30} />
      </a>
    </div>
  );
})`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

export default Socials;
