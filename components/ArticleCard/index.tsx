import Link from "next/link";

export type Poem = {
  id?: string;
  title: string;
  image: string;
  content: string;
  createdAt: string;
};

const ArticleCard = ({
  className,
  article,
}: {
  className?: any;
  article: Poem;
}) => {
  const { title, image, content, createdAt, id } = article;
  return (
    <Link href={`/articles/${+id! - 1}`}>
      <div className="min-w-[200px] min-h-[300px] ">
        <div
          style={{ backgroundImage: `url(${image})` }}
          className="shadow-2xl  rounded-lg mb-5 w-[200] h-[200]"
        >
          <img src={image} alt={title} width={200} />
        </div>
        <div className="px-3 ">
          <h3 className="font-black text-[1.2rem] ">{title}</h3>
          <button className="text-left text-sm text-black">
            {" "}
            {`${content.split("").slice(0, 50).join("")}...`}{" "}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard;
