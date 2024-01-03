import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Carousel from "nuka-carousel";
import styled from "styled-components";
import headerRightImg from "../assets/header-right.png";
import pstEmma from "../assets/pst-emaa.png";
import Wid from "../components/Icons/Wid";
import InfoCard, { InfoCardProps } from "../components/InfoCard";
import Socials from "../components/Socials";
import Navbar from "../components/Navbar";
import AboutMe from "../components/AboutMe";
import WhatIDo from "../components/WhatIDo";
import Footer from "../components/Footer";
import Marquee from "react-fast-marquee";
import wa1 from "../assets/worked_at1.png";
import wa2 from "../assets/worked_at2.png";
import wa3 from "../assets/worked_at3.png";
import { TypeAnimation } from "react-type-animation";

const Home: NextPage = styled(({ className }) => {
  return (
    <div className={className}>
      <Head>
        <title>Emmanuel Emodiae</title>
        <meta name="description" content="" />
        <meta
          name="keyword"
          content="Rental, Trucks, Dump Truck, Building, Materials, Construction"
        />
        <meta property="og:site_name" content="Emmanuel Emodiae" />
        {/* <meta
          property="og:image"
          content="https://www.materialspro.ng/logo.png"
        /> */}
        <meta
          property="og:title"
          content="Preacher, Prophet, Poet"
          key="title"
        />
        <meta
          property="og:description"
          content="Preacher, Prophet, Poet"
          key="description"
        />
        <meta property="og:type" content="website" />
        {/* <meta property="og:url" content="https://godump.co" /> */}
        <meta name="twitter:title" content="Emmanuel I. Emodiae" />
        <meta name="twitter:description" content="Preacher, Prophet, Poet" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@godump" />
        <meta property="twitter:image" content="https://godump.co" />
        <link rel="canonical" href="https://godump.co" />
      </Head>

      <main className="main">
        <Navbar />
        <header className="header-section">
          <section className="header-left">
            <h1 data-aos="fade-up" className="title">
              EMMANUEL I. EMODIAE
            </h1>
            <h3>
              <span className="subtitle">
                <TypeAnimation
                  sequence={[
                    "Prophet", // Types 'One'
                    2000, // Waits 1s
                    "Preacher", // Deletes 'One' and types 'Two'
                    2000, // Waits 2s
                    "Poet", // Types 'Three' without deleting 'Two'
                    2000,
                    () => {
                      console.log("Done typing!"); // Place optional callbacks anywhere in the array
                    },
                  ]}
                  wrapper="div"
                  cursor={true}
                  repeat={Infinity}
                  style={{ fontSize: "1em" }}
                />
              </span>
            </h3>
          </section>
          <section className="header-right">
            <Image
              data-aos="fade-down"
              placeholder="blur"
              src={headerRightImg}
              alt=""
              className="header-right-img"
            />
          </section>
        </header>
        <section className="welcome-section">
          <h3 data-aos="fade-in">Welcome!</h3>
          <p>
            This is the place for people like you, who posses a dogged passion
            to fulfill destiny and read nice article
          </p>
        </section>

        {/* ABOUT SECTION */}

        <AboutMe />

        {/* WHAT I DO SECTION */}

        <WhatIDo />

        <section className="poems">
          <h3 className="poems-title">POEMS</h3>
          <Carousel
            autoplay={true}
            withoutControls
            wrapAround={true}
            speed={200}
            slidesToScroll={2}
            swiping
            // animation="fade"
          >
            <div className="poem">
              <h4>Stranded Dreams</h4>
              <p>
                Thist is the place for people like you, who love to learn and
                read nice article Thist is the place for people like you, who
                love to learn and read nice article
              </p>
            </div>
            <div className="poem">
              <h4>Victory</h4>
              <p>
                Thist is the place for people like you, who love to learn and
                read nice article Thist is the place for people like you, who
                love to learn and read nice article
              </p>
            </div>
            <div className="poem">
              <h4>Love</h4>
              <p>
                Thist is the place for people like you, who love to learn and
                read nice article Thist is the place for people like you, who
                love to learn and read nice article
              </p>
            </div>
          </Carousel>
          <span className="quote"></span>
        </section>
        <section className="worked-at">
          <Marquee
            // pauseOnHover={true}
            pauseOnClick={true}
            gradient={false}
            speed={100}
            className={"marquee"}
          >
            <Image placeholder="blur" src={wa1} alt="" className="marq-img" />
            <Image placeholder="blur" src={wa2} alt="" className="marq-img" />
            <Image placeholder="blur" src={wa3} alt="" className="marq-img" />
          </Marquee>
        </section>
        <Footer />
      </main>
    </div>
  );
})`
  color: ${({ theme }) => theme.colors.primary};

  // HEADER

  .header-section {
    display: flex;
    width: 100%;
    margin: 0 auto;
    min-height: 70vh;
    justify-content: space-around;
    .header-left {
      align-self: center;
    }
    @media (max-width: 767px) {
      .header-right {
        display: none;
      }
    }
  }
  .title {
    color: ${({ theme }) => theme.colors.primary};
    font-family: ${({ theme }) => theme.colors.headerFont} !important;
    // border: 1px solid red;
  }
  .subtitle,
  .welcome-section h3 {
    font-family: ${({ theme }) => theme.decorFont};
    font-weight: normal;
  }

  // WELCOME

  .welcome-section {
    background: ${({ theme }) => theme.colors.primaryAccent};
    width: 100%;
    padding: 5rem 0;
    text-align: center;

    p {
      width: 50%;
      margin: 0 auto;
      @media (max-width: 486px) {
        width: 80%;
      }
    }
  }

  //  PEOMS

  .poems {
    width: 50%;
    margin: 0 auto;
    padding-bottom: 5rem;
    background: url(/assets/wid-bg.png);
    background-size: cover;
    color: ${({ theme }) => theme.colors.secondary};
    // font-size: 1rem;
    .poem h4 {
      margin: 1rem auto;
    }
    * {
      text-align: center;
    }
    .quote {
    }

    @media (max-width: 486px) {
      width: 80%;
    }
  }

  // WORKED AT

  .worked-at {
    width: 100%;
    padding: 1.5rem 2rem;
    background: ${({ theme }) => theme.colors.primaryAccent};

    .marq-img {
      margin-left: 4rem;
      transform: scale(0.5);
    }
  }
`;

export default Home;
