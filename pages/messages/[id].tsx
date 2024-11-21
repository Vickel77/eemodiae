import { useRouter } from "next/router";
import Link from "next/link";
import image from "../../assets/book1.png";
import Share from "../../components/Share";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { createClient } from "contentful";
import Head from "next/head";
import renderImage from "../../helpers/renderImage";
import { MdArrowLeft } from "react-icons/md";

const client = createClient({
  space: "7rf3l1j0b9zd",
  accessToken: "lD4oHO4B6sURlPIVrmkoZthACYqHbsFQVc4uw6QhVHI",
});

const AudioPage = ({
  selectedAudio,
  messages,
}: {
  selectedAudio: Message;
  messages: Message[];
}) => {
  const router = useRouter();
  const { id } = router.query;

  // Filter out the current audio from suggestions
  const suggestions = messages
    ?.filter(
      (audio, index) => audio.title.toLowerCase() !== String(id)?.toLowerCase()
    )
    .slice(0, 5);

  const _image = selectedAudio?.imageUrl?.fields?.file?.url ?? image.src;

  const shareUrl = `https://eemodiae.org/messages/${id}?${selectedAudio?.title.replace(
    / /g,
    "_"
  )}`;

  if (!selectedAudio) {
    return <div>Audio not found</div>;
  }

  return (
    <>
      <Head>
        <title>
          {(selectedAudio && selectedAudio.title) || "Eemodiae Sermon"}
        </title>

        <meta
          name="description"
          content={"Explore inspiring messages on Eemodiae"}
        />
        <link rel="canonical" href={shareUrl} />

        {/* Open Graph Tags */}
        <meta property="og:site_name" content="Eemodiae" />
        <meta
          property="og:title"
          content={selectedAudio?.title || "Eemodiae Sermon"}
          key="title"
        />
        <meta
          property="og:description"
          content={"Explore inspiring Messages on Eemodiae."}
          key="description"
        />
        <meta
          property="og:image"
          content={`https:${renderImage(selectedAudio?.imageUrl)}`}
        />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:type" content="article" />
        <meta
          property="og:image:alt"
          content={selectedAudio?.title || "Eemodiae Sermon"}
        />

        {/* Twitter */}

        <meta name="twitter:title" content={selectedAudio?.title} />
        <meta
          name="twitter:description"
          content={"Explore inspiring Messages on Eemodiae."}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@eemodiae" />
        <meta
          property="twitter:image"
          content={`https:${renderImage(selectedAudio?.imageUrl)}`}
        />
        <meta
          name="twitter:image:alt"
          content={selectedAudio?.title || "Eemodiae Sermon"}
        />
      </Head>
      <div className="min-h-screen bg-gray-100 p-5 text-primary">
        <Navbar />
        <div className="container mx-auto my-10">
          <button
            onClick={() => router.push("/messages")}
            className="flex gap-2 items-center rounded-lg border-1 border-primary px-3 mb-5"
          >
            <MdArrowLeft />
            Back
          </button>
          <div className="flex flex-col md:flex-row gap-5">
            {/* Main Audio Player Section */}
            <div
              style={{ backgroundImage: _image, backgroundSize: "cover" }}
              className={`flex-1 bg-white shadow-md rounded-lg p-6`}
            >
              <h1 className="text-3xl font-semibold mb-5">
                {selectedAudio.title}
              </h1>

              <div className="relative h-[300px] rounded-lg w-full flex justify-center items-center overflow-hidden">
                <img
                  src={_image}
                  // layout="fill"
                  // objectFit="cover"
                  width="100%"
                  className="rounded-lg"
                  alt={selectedAudio.title}
                />
              </div>

              <div className="mt-5 flex gap-5 items-center justify-center">
                <audio controls>
                  <source
                    src={selectedAudio?.audio?.fields?.file?.url}
                    type="audio/mp3"
                  />
                  Your browser does not support the audio element.
                </audio>
                <div>
                  <Share
                    shareUrl={`https://eemodie.org/messages/${selectedAudio.title}`}
                    icon
                    title={selectedAudio.title}
                  />
                </div>
              </div>
            </div>

            {/* Suggestions Section */}
            <div className="w-full md:w-[30%]">
              <h2 className="text-xl font-bold mb-4">Up Next</h2>
              <div className="space-y-4">
                {suggestions?.map((audio, index) => (
                  <Link
                    className="flex items-center bg-white shadow-md rounded-lg p-3"
                    href={`/messages/${audio.title}`}
                    key={index}
                  >
                    <div className="relative overflow-hidden rounded-full">
                      <img
                        src={audio.imageUrl?.fields?.file?.url}
                        width="50"
                        // height="100"
                        className="rounded-full"
                        alt={audio.title}
                      />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-semibold">{audio.title}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export async function getServerSideProps(context: any) {
  const { id } = context.params;

  const entries = await client.getEntries({
    content_type: "eemodiaeMessages",
  });

  const sanitizedEntries: Message[] =
    entries &&
    entries.items.map((item: any) => {
      return {
        ...item.fields,
        image: entries?.includes?.Asset?.[0].fields?.file.url,
      };
    });

  const selectedAudio: Message | undefined = sanitizedEntries?.find(
    (audio, index) => audio.title.toLowerCase() === String(id)?.toLowerCase()
  );

  // If the post does not exist, return a 404 page
  if (!sanitizedEntries) {
    return {
      notFound: true,
    };
  }

  return {
    props: { selectedAudio, messages: sanitizedEntries }, // Pass the post data to the component as props,
  };
}

export default AudioPage;
