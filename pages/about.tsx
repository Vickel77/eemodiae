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
        <section className="who-we-are">
          <h3>WHO WE ARE</h3>
          <p data-aos="fade-in">
            House of Joy Worldwide is an International church that believes in
            the wonders, miracles and the new move of God. We are located at
            Phase 3 opposite iCAN national theatre, Abuja. Find your way using
            the map below:
          </p>
        </section>
        <section className="google-map">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d42141.2788646589!2d7.321218893341167!3d9.13857044566011!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sbyhazin%20tipper%20garage%20abuja!5e0!3m2!1sen!2sng!4v1676913109832!5m2!1sen!2sng"
            width="600"
            height="450"
            // style="border:0;"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </section>
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
