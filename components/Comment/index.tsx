import { useState } from "react";
import styled from "styled-components";
import formatTime from "../../util/formatTime";

const Comment = styled(
  ({
    comment,
    callback,
    color,
  }: {
    comment: { id: string; name: string; comment: string; createdAt: string };
    callback: () => void;
    color: any;
  }) => {
    const [deleting, setDeleting] = useState<boolean>(false);

    return (
      <div className={"comment-wrap"}>
        <section className={"header"}>
          {/* <div className={styles.image} style={{ backgroundColor: color }}>
          {comment.name.split("")[0].toUpperCase()}
        </div> */}
          <h3>{comment.name}</h3>
          <span className={"time"}>{formatTime(comment.createdAt)}</span>
        </section>
        <article>{comment.comment}</article>
        {/* <section className={`${styles.footer} c-end`}>
        {isAdmin && (
          <Popconfirm
            okButtonProps={{ danger: true, size: "large" }}
            cancelButtonProps={{ type: "link", size: "large" }}
            okText="YES"
            cancelText="NO"
            title="Sure to Delete Comment?"
            onConfirm={() => handleDelete()}
          >
            <Button loading={deleting} type="primary" danger>
              Delete
            </Button>
          </Popconfirm>
        )}
      </section> */}
      </div>
    );
  }
)`
  .comment-wrap {
    padding: 0.6rem 0rem;
    margin-top: 1rem;
    font-size: 0.9rem;
  }
  .time {
    font-size: 0.75rem;
    opacity: 0.75;
  }
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .header > * {
    margin: 0;
  }
  .comment-wrap .image {
    /* padding: 10px; */
    width: 40px;
    height: 40px;
    background-color: #aa22dd22;
    border-radius: 50%;
    margin-right: 0.6rem;
    font-weight: 900;
    font-size: 1.5rem;
    display: grid;
    place-items: center;
  }

  .footer {
    padding: 1rem 0 0 0;
    font-size: 0.7rem;
    align-items: flex-end;
    /* display: flex;
  justify-content: space-between;
  text-align: right; */
  }
  .footer > span {
    opacity: 0.5;
  }

  /* ADD COMMENT */

  .form {
    background-color: #fafafa;
    border-radius: 1rem;
  }

  .form-btn {
    /* position: absolute; */
    display: flex;
    width: 100%;
    justify-content: flex-end;
    padding-bottom: 0.5rem;
  }
  .form-btn > * {
    transform: rotateZ(-45deg);
  }
`;

export default Comment;
