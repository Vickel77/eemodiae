import Image from "next/image";
import styled from "styled-components";
import InfoCard, { InfoCardProps } from "../InfoCard";
import widBg from "../../assets/wid-bg.png";
import Wid from "../Icons/Wid";

const wid: InfoCardProps = [
  {
    icon: <Wid idx={1} />,
    title: "Prophet",
    description:
      "Thist is the place for people like you, who love to learn and read nice article Thist is the place for people like you, who love to learn and read nice article",
  },
  {
    icon: <Wid idx={2} />,
    title: "Preacher",
    description:
      "Thist is the place for people like you, who love to learn and read nice article Thist is the place for people like you, who love to learn and read nice article",
  },
  {
    icon: <Wid idx={3} />,
    title: "Poet",
    description:
      "Thist is the place for people like you, who love to learn and read nice article Thist is the place for people like you, who love to learn and read nice article",
  },
];

const WhatIDo = styled(({ className }) => {
  return (
    <div className={className}>
      <section className="what-i-do">
        <div className="wid-img">
          <Image
            src={widBg}
            alt="wid-bg"
            height="50"
            // fill
            // width="100vw"
            // sizes="100vw"
          />
        </div>
        <h3>What I Do</h3>
        <div className="info-items">
          {wid.map((item, index) => (
            <div data-aos="fade-up" data-aos-delay={100 * index}>
              <InfoCard item={item} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
})`
  .what-i-do {
    width: 100%;
    display: grid;
    place-items: center;
    text-align: center;
    color: ${({ theme }) => theme.colors.secondary};
    padding: 7rem 0;
    position: relative;
    .wid-img {
      position: absolute;
      top: 0;
      display: none;
    }

    .info-items {
      width: 80%;
      margin: 4rem auto 0;
      display: flex;
      gap: 3rem;
      justify-items: space-between;
      @media (max-width: 767px) {
        flex-wrap: wrap;
      }
    }
  }
`;

export default WhatIDo;
