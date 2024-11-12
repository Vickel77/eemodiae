import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";
import useContentful from "../../hooks/useContentful";
import image from "../../assets/book1.png";
import Share from "../../components/Share";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { MdArrowLeft } from "react-icons/md";
import PageLoader from "../../components/PageLoader";

const AudioPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const { getMessages, messages } = useContentful();

  useEffect(() => {
    getMessages();
  }, []);

  // Find the selected audio based on the ID from the URL
  let selectedAudio = useMemo(
    () =>
      messages?.find(
        (audio) => audio.title.toLowerCase() === String(id)?.toLowerCase()
      ),
    [id, messages]
  );

  if (!selectedAudio) {
    selectedAudio = useMemo(
      () =>
        messages?.find((message) =>
          message.audio_file.find(
            (audio_file) =>
              audio_file.fields.title.toLowerCase() ===
              String(id)?.toLowerCase()
          )
        ),
      [id, messages]
    );
  }

  console.log({ selectedAudio });

  let audio = selectedAudio?.category
    ? selectedAudio.audio_file.find(
        (audio) =>
          audio.fields.title.toLowerCase() === String(id)?.toLowerCase()
      )?.fields.file.url
    : selectedAudio?.audio?.fields?.file?.url;

  if (messages === undefined) {
    return <PageLoader />;
  }
  if (!selectedAudio) {
    return <div>Audio not found</div>;
  }

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

  const _image = selectedAudio?.imageUrl?.fields?.file?.url ?? image.src;

  return (
    <>
      <div className="min-h-screen bg-gray-100 p-5 text-primary">
        <Navbar />
        <div className="container mx-auto my-10">
          <button
            onClick={() => router.push(`/messages`)}
            className="flex gap-2 items-center rounded-lg border-1 border-primary px-3 mb-5"
          >
            <MdArrowLeft />
            Back
          </button>
          <div className="flex flex-col md:flex-row gap-5">
            {/* Main Audio Player Section */}
            <div className="relative flex-1">
              {/* Blurred Background */}
              <div
                style={{
                  backgroundImage: `url(${_image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: "blur(10px)",
                }}
                className="absolute inset-0 rounded-lg opacity-20"
              ></div>

              {/* Content Overlay */}
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

                <div className="mt-5 flex gap-5 items-center justify-center">
                  <audio key={String(id)} controls>
                    <source src={audio} type="audio/mp3" />
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
            </div>

            {/* Suggestions Section */}
            <div className="w-full md:w-[30%]">
              <h2 className="text-xl font-bold mb-4">Up Next</h2>
              <div className="space-y-4 overflow-scroll">
                {!selectedAudio.category
                  ? suggestions?.map((audio, index) => (
                      <SuggestCard
                        title={audio.title}
                        image={audio.imageUrl.fields.file.url}
                        router={router}
                      />
                    ))
                  : categorySuggestions?.map((audio, index) => (
                      <SuggestCard
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

export default AudioPage;
