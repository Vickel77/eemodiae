import styled from "styled-components";
import renderImage from "../../helpers/renderImage";

const MusicCard = styled(
  ({ className, item }: { className?: any; item: Music }) => {
    const { title, imageUrl, artiste } = item;
    return (
      <div className={className}>
        <div className="image">
          <img
            key={title}
            className="img"
            src={renderImage(imageUrl)}
            alt={title}
            width="100%"
          />
        </div>
        <aside>
          <b className="title block text-sm">{title}</b>

          <p className="text-xs">{artiste}</p>
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
  // max-width: 200px;
  // height: 200px;
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

export default MusicCard;
