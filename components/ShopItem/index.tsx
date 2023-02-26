import styled from "styled-components";
import { Rating } from "react-simple-star-rating";
import Image from "next/image";
import chatOnWhatsApp from "../../assets/chat-on-whatsapp.png";

const ShopItme = styled(
  ({ className, item }: { className?: any; item: ShopProps }) => {
    const { title, image, price } = item;
    return (
      <div className={className}>
        <div className="image">
          <img className="img" src={image} alt={title} width="100%" />
          <div className="overlay">
            {/* <button className="btn">BUY NOW</button> */}
            <b>Order Now</b>
            <a
              href={`https://wa.me/23481352653048?text=I'm%20inquiring%20about%20the%20Book:%20${title}`}
              target="_blank"
              rel="noreferrer"
            >
              <Image
                className="cta"
                width={200}
                src={chatOnWhatsApp}
                alt="Chat on whatsapp"
              />
            </a>
          </div>
        </div>
        <aside>
          <b className="title">{title}</b>
          <p>₦{price.toLocaleLowerCase()}</p>
          <small className="">
            Rating <Rating size={20} initialValue={3} />
          </small>
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
    width: 100%;
    overflow: hidden;
    display: grid;
    place-items: center;
    place-content: center;
    border-radius: 7.5px;
    .overlay {
      width: inherit;
      height: inherit;
      background: ${({ theme }) => theme.colors.primary}77;
      display: grid;
      place-items: center;
      place-content: center;
      transition: 0.2s;
      opacity: 0;
      overflow: hidden;
      backdrop-filter: blur(10px);
      color: #fff;
      .cta {
        box-shadow: 0 4px 10px #00000022;
        cursor: pointer;
        transition: 0.2s;
        transform: translateY(100px);
      }
    }

    .cta:hover {
      box-shadow: 0 4px 30px #00000077;
    }
    &:hover .overlay {
      opacity: 1;
    }
    &:hover .cta {
      transform: translateY(0);
    }
  }

  aside {
    b {
      color: ${({ theme }) => theme.colors.primary};
    }
    padding: 0.5rem;
  }
`;

export default ShopItme;
