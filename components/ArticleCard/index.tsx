import Link from "next/link";
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import renderImage from "../../helpers/renderImage";

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
  id,
}: {
  className?: any;
  article: Article;
  id?: number;
}) => {
  const { title, image, image_url, content, createdAt } = article;
  console.log("Article ", article);
  return (
    <Link
      href={{
        pathname: `/articles/${+id!}`,
        query: {
          article: JSON.stringify(article),
        },
      }}
    >
      <div className="min-w-[200px] min-h-[300px] mb-5 border-2 border-[transparent] hover:opacity-70 transition-all rounded-lg ">
        <div
          style={{
            backgroundImage: `url(${renderImage(image_url)})`,
            backgroundSize: "cover",
          }}
          className="shadow-2xl rounded-lg mb-5 w-full h-[200px]"
        >
          {/* <img src={renderImage(image_url)} alt={title} width={200} /> */}
        </div>
        <div className="px-3 ">
          <h3 className="font-black text-[1.2rem] ">{title}</h3>
          <button className="text-left text-sm text-black">
            {" "}
            <div
              dangerouslySetInnerHTML={{
                __html: documentToHtmlString(content)
                  .split("")
                  .slice(0, 50)
                  .join(""),
              }}
            />
            {/* {`${documentToHtmlString(content)
              .split("")
              .slice(0, 50)
              .join("")}...`}{" "} */}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard;
