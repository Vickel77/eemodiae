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
        <title>About Emmanuel I. Emodiae</title>
        <meta
          name="description"
          content="I‘m a passionate and prophetic preacher of Jesus Christ, called to share His transformative message."
        />
        <meta property="og:site_name" content="Emmanuel Emodiae" />
        <meta
          property="og:title"
          content="About Emmanuel I. Emodiae"
          key="title"
        />
        <meta
          property="og:image"
          content="https://res.cloudinary.com/dwgywtak8/image/upload/v1728429195/vp7swuvjmzrofkb0zlv2.png"
          key="title"
        />
        <meta
          property="og:description"
          content="I‘m a passionate and prophetic preacher of Jesus Christ, called to share His transformative message."
          key="description"
        />

        <meta name="twitter:title" content="About Emmanuel I. Emodiae" />
        <meta
          name="twitter:description"
          content="I‘m a passionate and prophetic preacher of Jesus Christ, called to share His transformative message."
        />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@eemodiae" />
        <meta
          property="twitter:image"
          content="https://res.cloudinary.com/dwgywtak8/image/upload/v1728429195/vp7swuvjmzrofkb0zlv2.png"
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
