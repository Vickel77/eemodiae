import Link from "next/link";
import styled from "styled-components";
import useAuth from "../../hooks/useAuth";

export type Poem = {
  id?: string;
  title: string;
  image: string;
  content: string;
  createdAt: string;
  scripture: string;
};

const PeomCard = styled(
  ({ className, poem }: { className?: any; poem: Poem }) => {
    const { isLoggedIn } = useAuth();
    const { title, image, content, createdAt, id } = poem;
    return (
      <div className={className}>
        <div>
          <h3>{title}</h3>
          <div className="flex gap-3">
            <Link href={`/poems/${+id! - 1}`}>
              <button className="btn">READ</button>
            </Link>
            {isLoggedIn && <button className="btn btn-danger">Delete</button>}
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
    url(${(props) => props.poem.image});
  background-size: cover;
  display: flex;
  align-items: flex-end;
  border-radius: 5px;
  color: #fff;
  h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
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
