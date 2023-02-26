import React from "react";
import styled from "styled-components";

type InfoObj = { icon: JSX.Element; title: string; description: string };

export type InfoCardProps = InfoObj[];

const InfoCard = styled(
  ({ item, className }: { item?: InfoObj; className?: any }) => {
    const { icon, title, description } = item!;
    return (
      <div className={className}>
        <div className="header">
          <span className="icon">{icon}</span>
        </div>
        <div className="body">
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>
    );
  }
)`
  --borderRadius: 20px;

  background: ${({ theme }) => theme.colors.white};
  backdrop-filter: blur(20px);
  min-width: 250px;
  border-radius: var(--borderRadius);
  box-shadow: 0 5px 55px ${({ theme }) => theme.colors.primary}22;
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.secondary};
  transform: ${(props) =>
    props.item?.title.toLocaleLowerCase() === "preacher"
      ? "scale(1.1)"
      : "scale(1)"};

  @media (max-width: 767px) {
    transform: scale(1);
  }

  div {
    width: 100%;
    padding: 1rem;
  }
  div.header {
    height: 120px;
    background: ${({ theme }) => theme.colors.secondary};
    display: grid;
    place-items: center;
    border-radius: var(--borderRadius);
    .icon {
      background: ${({ theme }) => theme.colors.white};
      border: 10px solid ${({ theme }) => theme.colors.secondary};
      border-radius: 50%;
      width: 130px;
      height: 130px;
      display: grid;
      place-items: center;
    }
  }

  div.body {
    padding: 2rem 1rem;
    p {
      text-align: left;
      font-size: 0.95rem;
      margin-top: 0.5rem;
      padding: 0.5rem 1.2rem 0;
    }
  }
`;

export default InfoCard;
