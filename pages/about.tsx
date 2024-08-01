import React from "react";
import styled from "styled-components";
import AboutMe from "../components/AboutMe";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import WhatIDo from "../components/WhatIDo";

const About = styled(({ className }) => {
  return (
    <div className={className}>
      <Navbar />
      <main>
        <AboutMe showMore />
        <WhatIDo />
      </main>
      <Footer />
    </div>
  );
})`
  padding-top: 5rem;

  .who-we-are {
    width: 80%;
    margin: 2rem auto;
    text-align: center;
    color: ${({ theme }) => theme.colors.secondary};
    h3 {
      margin-bottom: 2rem;
    }
  }
  .google-map {
    width: 100%;
    display: grid;
    place-items: center;
    margin-bottom: 4rem;
    & > * {
      width: 80%;
      border: none;
      outline: transparent;
      border-radius: 10px;
      box-shadow: 0 4px 10px #00000022;
    }
  }
`;

export default About;
