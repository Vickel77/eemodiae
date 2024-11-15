import styled from "styled-components";
import useAuth from "../../hooks/useAuth";
import withPoem from "../../hoc/withPoem";
import PoemModal from "../Modals/PoemModal";
import { useState } from "react";
import CategoryModal from "../CategoryModal";

export type Category = { image: string; title: string };

const UpdatePoem = withPoem(PoemModal);

const API_URL = process.env.API_URL_LOCAL;

const CategoryCard = styled(
  ({
    className,
    category,
    id,
    categoryMessage,
  }: {
    className?: any;
    category: Category;
    id?: number;
    categoryMessage: Message;
  }) => {
    const { isLoggedIn } = useAuth();
    const { title, image } = category;

    const [showModal, setShowModal] = useState<boolean>(false);

    return (
      <>
        <div onClick={() => setShowModal(true)} className={className}>
          <div className="overlay">
            <h3>{title}</h3>
            {/* <div className="flex gap-3">
            <div>
              <button className="btn">READ</button>
            </div>
          </div> */}
          </div>
          <div className="py-1 px-3 text-sm rounded-full bg-primary text-white absolute top-2 right-2  z-auto">
            Series
          </div>
        </div>
        <CategoryModal
          message={categoryMessage}
          showModal={showModal}
          setShowModal={setShowModal}
        />
      </>
    );
  }
)`
  position: relative;
  min-width: 250px;
  min-height: 250px;
  overflow: hidden;
  background: -webkit-linear-gradient(#00000022, #00000055),
    url(${(props) => props.category.image});
  background-size: cover;
  background-position: center center;
  display: flex;
  align-items: flex-end;
  border-radius: 10px;
  color: #fff;
  position: relative;

  &:hover .overlay {
    top: 0;
    opacity: 1;
    cursor: pointer;
  }
  &:hover h3 {
    opacity: 1;
  }
  .overlay {
    opacity: 0;
    background: rgba(0, 0, 0, 0.8);
    position: absolute;
    top: 200px;
    min-width: 250px;
    min-height: 250px;
    padding: 1rem;
    transition: 0.25s;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  h3 {
    font-size: 1.5rem;
    line-height: 1.1;
    opacity: 0;
    transition: 0.3s;
    // margin-bottom: 0.5rem;
    text-align: center;
  }
  .btn {
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
  }
  .btn-danger {
    background: ${({ theme }) => theme.colors.danger};
  }
`;

export const CategoryCardV2 = ({
  className,
  category,
  id,
  categoryMessage,
}: {
  className?: any;
  category: Category;
  id?: number;
  categoryMessage: Message;
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const { title, image } = category;
  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className=" flex items-center border backdrop-blur-3xl  rounded-md min-w-[300px] w-[300px] bg-[#ffffff55]  overflow-hidden"
        // style={{ background: `url(${image})` }}
      >
        <div className=" flex items-center justify-center max-w-12 h-12 overflow-hidden">
          <img src={image} alt={title} height="100%" width="100%" />
        </div>
        <div className=" px-5 text-sm text-primary"> {title}</div>
      </div>
      <CategoryModal
        message={categoryMessage}
        showModal={showModal}
        setShowModal={setShowModal}
      />
    </>
  );
};
export default CategoryCard;
