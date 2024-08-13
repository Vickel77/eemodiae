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

    console.log("image ", image);
    console.log("categoryMessage ", categoryMessage);

    const [showModal, setShowModal] = useState<boolean>(false);

    return (
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
        <CategoryModal
          message={categoryMessage}
          showModal={showModal}
          setShowModal={setShowModal}
        />
      </div>
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

export default CategoryCard;
