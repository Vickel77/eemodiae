import Link from "next/link";
import styled from "styled-components";
import useAuth from "../../hooks/useAuth";
import withPoem from "../../hoc/withPoem";
import PoemModal from "../Modals/PoemModal";
import { useState } from "react";
import { toast } from "react-toastify";
import renderImage from "../../helpers/renderImage";

const UpdatePoem = withPoem(PoemModal);

const API_URL = process.env.API_URL_LOCAL;

const PeomCard = styled(
  ({
    className,
    poem,
    setShowModal,
    id,
  }: {
    className?: any;
    poem: Poem;
    setShowModal: any;
    id?: number;
  }) => {
    const { isLoggedIn } = useAuth();
    const { title } = poem;
    const [isSubmitting, setIsSubmitting] = useState<boolean>();

    const [showUpdateModal, setShowUpdateModal] = useState<boolean>();

    const handleUpdate = async (values: PoemForm) => {
      setIsSubmitting(true);
      try {
        const response = await fetch(`${API_URL}/poem/${id}`, {
          method: "PUT", // *GET, POST, PUT, DELETE, etc.
          mode: "cors", // no-cors, *cors, same-origin
          cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
          credentials: "same-origin", // include, *same-origin, omit
          headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
          },
          redirect: "follow", // manual, *follow, error
          referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
          body: JSON.stringify(values), // body data type must match "Content-Type" header
        });

        toast("Post updated Successful");
      } catch (error) {
        toast("Post not updated Successful");
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className={className}>
        <div>
          <h3 className="capitalize line-clamp-2 leading-6">{title}</h3>
          <div className="flex gap-3">
            <Link
              href={{
                pathname: `/poems/${poem.title!}`,
                // query: {
                //   poem: JSON.stringify(poem.title),
                // },
              }}
            >
              <button className="btn">READ</button>
            </Link>
            {isLoggedIn && (
              <>
                <button className="btn btn-danger">Delete</button>{" "}
                <button
                  onClick={() => setShowUpdateModal(true)}
                  className="btn"
                >
                  Update
                </button>{" "}
                <UpdatePoem
                  poemInfo={poem}
                  showModal={showUpdateModal}
                  onCancel={() => setShowModal(false)}
                  handleSubmit={(values) => handleUpdate(values)}
                  isSubmitting={isSubmitting}
                />
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
)`
  min-width: 200px;
  min-height: 250px;
  padding: 1.2rem;
  background: -webkit-linear-gradient(#00000055, #000000aa),
    url(${(props) => renderImage(props.poem?.image_url)});
  background-size: cover;
  display: flex;
  align-items: flex-end;
  border-radius: 5px;
  color: #fff;
  h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    text-transform: capitalize;
  }
  .btn {
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
  }
  .btn-danger {
    background: ${({ theme }) => theme.colors.danger};
  }
`;

export default PeomCard;
