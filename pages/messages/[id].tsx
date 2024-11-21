import { useRouter } from "next/router";
import image from "../../assets/book1.png";
import Share from "../../components/Share";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { MdArrowLeft } from "react-icons/md";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { MdDownload } from "react-icons/md";
import { createClient } from "contentful";
import Head from "next/head";
import renderImage from "../../helpers/renderImage";
import { useMemo } from "react";

const client = createClient({
  space: "7rf3l1j0b9zd",
  accessToken: "lD4oHO4B6sURlPIVrmkoZthACYqHbsFQVc4uw6QhVHI",
});

const AudioPage = ({
  messages,
}: {
  selectedAudio: Message;
  messages: Message[];
}) => {
  const router = useRouter();
  const { id } = router.query;

  const selectedAudio = useMemo(() => {
    let _selectedAudio = messages?.find(
      (audio) => audio.title.toLowerCase() === String(id)?.toLowerCase()
    );

    if (!_selectedAudio) {
      _selectedAudio = messages?.find((message) =>
        message.audio_file.find(
          (audio_file) =>
            audio_file.fields.title.toLowerCase() === String(id)?.toLowerCase()
        )
      );
    }

    return _selectedAudio;
  }, [id, messages]);

  // Filter out the current audio from suggestions
  const suggestions = messages
    ?.filter(
      (audio) =>
        !audio.category &&
        audio.title.toLowerCase() !== String(id)?.toLowerCase()
    )
    .slice(0, 5);

  const categorySuggestions = messages?.find(
    (m) => m?.category === selectedAudio?.category
  )?.audio_file;

  const shareUrl = `https://eemodiae.org/messages/${id}?${selectedAudio?.title.replace(
    / /g,
    "_"
  )}`;

  const audio = selectedAudio?.category
    ? selectedAudio.audio_file.find(
        (audio) =>
          audio.fields.title.toLowerCase() === String(id)?.toLowerCase()
      )?.fields.file.url
    : selectedAudio?.audio?.fields?.file?.url;

  const _image = selectedAudio?.imageUrl?.fields?.file?.url ?? image.src;
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
            <div className="relative flex-1">
              <div
                style={{
                  backgroundImage: `url(${_image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: "blur(10px)",
                }}
                className="absolute inset-0 rounded-lg opacity-20"
              ></div>

              <div className="relative bg-white bg-opacity-0 shadow-md rounded-lg p-6">
                <h1 className="text-2xl font-semibold mb-5">{id}</h1>

                <div className="relative h-[300px] rounded-lg w-full flex justify-center items-center overflow-hidden">
                  <img
                    src={_image}
                    width="100%"
                    className="rounded-lg"
                    alt={selectedAudio.title}
                  />
                </div>

                <div className="mt-5 flex flex-wrap gap-5 items-center justify-center">
                  <AudioPlayer
                    src={audio}
                    autoPlay={false}
                    // showJumpControls={false}
                    customAdditionalControls={[]}
                    layout="stacked-reverse"
                    customVolumeControls={[]}
                    style={{
                      width: "100%",
                      backgroundColor: "transparent",
                    }}
                    showDownloadProgress
                  />

                  <div className="">
                    <Share
                      shareUrl={`https://eemodie.org/messages/${id}`}
                      icon
                      title={selectedAudio.title}
                    />
                  </div>
                  <button className="flex gap-3 ">
                    {/* <MdOutlineMonitorHeart /> */}
                    <a
                      href={`${audio}`}
                      // download={selectedAudio.title}
                      className="hover:opacity-80 flex justify-center items-center gap-2"
                      // onClick={() => window && window.open(audio)}
                      onClick={(e) => {
                        e.preventDefault();
                        fetch(audio)
                          .then((response) => response.blob())
                          .then((blob) => {
                            const blobURL = window.URL.createObjectURL(blob);
                            const link = document.createElement("a");
                            link.href = blobURL;
                            link.download = selectedAudio.title || "download";
                            link.click();
                            window.URL.revokeObjectURL(blobURL); // Clean up
                          });
                      }}
                    >
                      <MdDownload color="3624a7" size={25} />
                      <small>Download</small>
                    </a>
                  </button>
                </div>
              </div>
            </div>

            {/* Suggestions Section */}
            <div className="w-full md:w-[30%]">
              <h2 className="text-xl font-bold mb-4">Up Next</h2>
              <div className="space-y-4 overflow-scroll">
                {!selectedAudio.category
                  ? suggestions?.map((audio, index) => (
                      <SuggestCard
                        key={index}
                        title={audio.title}
                        image={audio.imageUrl.fields.file.url}
                        router={router}
                      />
                    ))
                  : categorySuggestions?.map((audio, index) => (
                      <SuggestCard
                        key={index}
                        title={audio.fields.title}
                        image={_image}
                        router={router}
                      />
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

const SuggestCard = ({
  router,
  image,
  title,
}: {
  router: any;
  image: string;
  title: string;
}) => {
  return (
    <div
      className="flex items-center bg-white shadow-md rounded-lg p-3 cursor-pointer"
      onClick={() => router.push(`/messages/${title}`)}
      key={title}
    >
      <div className="relative overflow-hidden rounded-full">
        <img src={image} width="50" className="rounded-full" alt={title} />
      </div>
      <div className="ml-4">
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
    </div>
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

  // If the post does not exist, return a 404 page
  if (!sanitizedEntries) {
    return {
      notFound: true,
    };
  }

  return {
    props: { messages: sanitizedEntries }, // Pass the post data to the component as props,
  };
}

export default AudioPage;
