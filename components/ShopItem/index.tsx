import styled from "styled-components";
import Image from "next/image";
import chatOnWhatsApp from "../../assets/chat-on-whatsapp.png";
import renderImage from "../../helpers/renderImage";

const ShopItme = styled(
  ({ className, item }: { className?: any; item: StoreItem }) => {
    const { title, image_url, price, category, artist } = item;
    return (
      <div className={className}>
        <div className="image">
          <img
            key={title}
            className="img"
            src={renderImage(image_url)}
            alt={title}
            width="100%"
          />
          {category !== "song" && (
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
          )}
        </div>
        <aside>
          <b className="title block">{title}</b>
          {category !== "song" ? (
            <p>₦{price}</p>
          ) : (
            <p className="text-sm">{artist}</p>
          )}
          {/* <div>
            Rating
            <Rating size={20} style={{ display: "flex" }} initialValue={3} />
          </div> */}
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
  // max-width: 300px;
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
