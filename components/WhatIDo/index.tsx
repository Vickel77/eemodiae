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
      "Divine messenger illuminating the path to purpose and fulfillment, receiving revelations to inspire and empower individuals to unlock their potential.",
  },
  {
    icon: <Wid idx={2} />,
    title: "Preacher",
    description:
      "Inspiring and guiding others on their spiritual journey, nurturing growth and development, and encouraging love, compassion, and service to others.",
  },
  {
    icon: <Wid idx={3} />,
    title: "Poet",
    description:
      "Crafting verses that capture the human experience, exploring themes of love, loss, hope, and resilience, and inspiring others to find their voice and tell their story.",
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
            <div key={index} data-aos="fade-up" data-aos-delay={100 * index}>
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
