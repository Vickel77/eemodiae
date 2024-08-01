import React from "react";
import styled from "styled-components";
import Facebook from "../Icons/Facebook";
import Instagram from "../Icons/Instagram";
import Twitter from "../Icons/Twitter";
import YouTube from "../Icons/YouTube";

const Socials = styled(({ className }) => {
  return (
    <div className={className}>
      @eemodiae
      <div className="content">
        <Twitter size={30} />
        <Instagram size={30} />
        <Facebook size={30} />
        <YouTube size={30} />
      </div>
    </div>
  );
})`
  .content {
    display: flex;
    gap: 1rem;
    margin-top: 0.5rem;
  }
  margin-top: 1rem;
  opacity: 0.75;
`;

export default Socials;
