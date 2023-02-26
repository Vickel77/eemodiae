import styled from "styled-components";

export type Poem = {
  id?: string;
  title: string;
  imageUrl: string;
  content: string;
  createdAt: string;
};

const PeomCard = styled(
  ({ className, poem }: { className?: any; poem: Poem }) => {
    const { title, imageUrl, content, createdAt } = poem;
    return (
      <div className={className}>
        <div>
          <h3>{title}</h3>
          <button className="btn">READ</button>
        </div>
      </div>
    );
  }
)`
  min-width: 200px;
  min-height: 250px;
  padding: 1.2rem;
  background: -webkit-linear-gradient(#00000055, #000000aa),
    url(${(props) => props.poem.imageUrl});
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
`;

export default PeomCard;
