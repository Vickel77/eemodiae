import Image from "next/image";
import styled from "styled-components";
import pstEmma from "../../assets/pst-emaa.png";
import Socials from "../Socials";

const AboutMe = styled(
  ({ className, showMore }: { className?: any; showMore?: boolean }) => {
    return (
      <div className={className}>
        <section className="about-me">
          {/* <div className="circle" /> */}
          <div className="circle left" />
          <div className="about-section-wrap">
            <article data-aos="fade-right" className="left-side">
              <Image
                placeholder="blur"
                src={pstEmma}
                alt=""
                className="left-img"
              />
            </article>
            <article className="right-side">
              <h3>About Me</h3>
              <p>
                I&lsquo;m a passionate and prophetic preacher of Jesus Christ,
                called to share His transformative message. Through my ministry,
                I aim to inspire believers to deepen their faith, discover their
                purpose, and walk in God&lsquo;s destiny for their lives.
              </p>
              {showMore && (
                <>
                  I pray that my ministry will spark spiritual awakening,
                  revival, and reformation, manifesting God&lsquo;s glory in
                  people&lsquo;s lives. I currently serve as the Lead Pastor of
                  House of Joy Church Worldwide
                  <br />
                  House of Joy Church Worldwide has a mandate to Preach CHRIST
                  THE BLESSING and deliver God&lsquo;s people from Mediocrity,
                  Poverty and Shame
                  <br />
                  <h4 className="name">EMMANUEL I. EMODIAE</h4>
                </>
              )}

              <aside data-aos="fade-up" className="about-socials">
                <Socials />
              </aside>
            </article>
          </div>
        </section>
      </div>
    );
  }
)`
  .about-me {
    background: ${({ theme }) => theme.colors.primary};
    padding: 3rem 0 0;
    color: ${({ theme }) => theme.colors.white};
    position: relative;
    overflow: hidden;
    .circle {
      width: 1000px;
      height: 1000px;
      border-radius: 50%;
      border: 200px solid ${({ theme }) => theme.colors.primaryAccent};
      opacity: 0.5;
      position: absolute;
      right: -50%;
      top: -70%;
    }
  }

  .about-section-wrap {
    width: 80%;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 4rem;

    .left-side {
      // width: 40%;
      transform: rotateY(180deg);
      @media (max-width: 767px) {
        display: none;
      }
    }
    .right-side {
      width: 80%;
      h3 {
        margin-bottom: 1rem;
      }
      .name {
        margin-top: 1rem;
      }
      @media (max-width: 767px) {
        text-align: center;
        padding-bottom: 3rem;
        display: grid;
        place-items: center;
        width: 100%;
      }
    }
    @media (max-width: 747px) {
      flex-wrap: wrap;
      justify-content: center;
    }
  }
`;

export default AboutMe;
