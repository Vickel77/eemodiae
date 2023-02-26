import Image from "next/image";
import styled from "styled-components";
import { Rating } from "react-simple-star-rating";

const ShopItme = styled(
  ({ className, item }: { className?: any; item: ShopProps }) => {
    const { title, image, price } = item;
    return (
      <div className={className}>
        <div className="image">
          <img className="img" src={image} alt={title} width="100%" />
        </div>
        <aside>
          <b className="title">{title}</b>
          <p>₦{price.toLocaleLowerCase()}</p>
          <sub className="">
            Rating <Rating initialValue={3} />
          </sub>
        </aside>
      </div>
    );
  }
)`
  background: ${({ theme }) => theme.colors.white};
  color: black;
  border-radius: 7.5px;
  overflow: hidden;
  box-shadow: 0 4px 10px #00000022;

  .image {
    height: 200px;
    overflow: hidden;
    display: grid;
    place-items: center;
    place-content: center;
  }

  aside {
    padding: 0.5rem;
  }
`;

export default ShopItme;
