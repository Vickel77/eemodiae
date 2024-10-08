import Head from "next/head";
import React from "react";
import styled from "styled-components";
import AboutMe from "../components/AboutMe";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import WhatIDo from "../components/WhatIDo";

const About = styled(({ className }) => {
  return (
    <div className={className}>
      <Head>
        <title>About Emmanuel Emodiae</title>
        <meta
          name="description"
          content="I‘m a passionate and prophetic preacher of Jesus Christ, called to share His transformative message."
        />
        <meta property="og:site_name" content="Emmanuel Emodiae" />
        <meta property="og:title" content="About Emodiae" key="title" />
        <meta
          property="og:description"
          content="valuable life transforming information
            and inspirational Materials!"
          key="description"
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://eemodiae.org" />
      </Head>
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
