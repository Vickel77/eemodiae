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
import { useMemo, useState } from "react";
import Link from "next/link";
import empty from "../../assets/empty-state.png"
import normalizeAndCompare, { cleanString } from "../../util/normalizeAndCompare";
import getCircularSlice from "../../util/getCircularIdx";

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

  const [currentAudioIndex, setCurrentAudioIndex] = useState<number>(-1);

  const selectedAudio = useMemo(() => {
    let _selectedAudio = messages?.find(
      (audio) => normalizeAndCompare(audio.title, String(id)) 
    );

    if (!_selectedAudio) {
      _selectedAudio = messages?.find((message) =>
        message.audio_file?.find(
          (audio_file) =>
            normalizeAndCompare(audio_file.fields.title, String(id))
        )
      );
    }

    // Update the currentAudioIndex based on the selected audio
    const index = messages?.findIndex(
      (audio) =>
        audio.title.toLowerCase() === _selectedAudio?.title.toLowerCase()
    );

    setCurrentAudioIndex(index ?? -1);

    return _selectedAudio;
  }, [id, messages]);

  // Filter out the  current audio from suggestions
  // 🔁 Helper: Circular next-N slice from an array



const idLower = String(id).trim().toLowerCase();

const filtered = messages.filter(msg => !msg.category);
const selectedIdx = filtered.findIndex(
  msg => msg.title.trim().toLowerCase() === idLower
);

const count = filtered.length < 5 ? filtered.length : 5;
const suggestions: Message[] =
  selectedIdx !== -1 ? getCircularSlice(filtered, selectedIdx, count) : [];

const categoryData = messages.find(
  m => m.category === selectedAudio?.category
)?.audio_file;

const catIdx = categoryData?.findIndex(
  aud => aud.fields.title.trim().toLowerCase() === idLower
);

const countCat = categoryData?.length! < 5 ? categoryData?.length : 5;
const categorySuggestions: any[] =
  categoryData && catIdx !== undefined && catIdx !== -1
    ? getCircularSlice(categoryData, catIdx, countCat!)
    : [];

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

  const handleAudioEnd = () => {
    // Check if there is a next suggestion
    let currentIndex = categorySuggestions?.findIndex(
      (suggestion:any) =>
        suggestion.fields.title.toLowerCase() === String(id).toLowerCase()
    );
    if (selectedAudio?.category) {
      if (currentIndex! + 1 >= categorySuggestions?.length!) return;
      const nextAudio = categorySuggestions?.[currentIndex! + 1];
      router.push(`/messages/${nextAudio?.fields.title}`);
      return;
    }
    if (currentAudioIndex + 1 < messages?.length) {
      const nextAudio = messages[currentAudioIndex + 1];
      router.push(`/messages/${nextAudio.title}`);
    }
  };

  console.log( {selectedAudio, len: categorySuggestions?.length!}  ) ;

  const showSuggestion = !selectedAudio?.category ? suggestions.length > 0 : categorySuggestions?.length! > 0 ! 

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
                    autoPlay={true}
                    onEnded={handleAudioEnd} // Autoplay next audio
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
                      shareUrl={`https://eemodiae.org/messages/${cleanString(id)}`}
                      icon
                      title={selectedAudio.title}
                    />
                  </div>
                  <button className="flex gap-3 ">
                    <Link
                      href={`${audio}`}
                      className="hover:opacity-80 flex justify-center items-center gap-2"
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
                    </Link>
                  </button>
                </div>
              </div>
            </div>

            {/* Suggestions Section */}
            <div className="w-full md:w-[30%]">
            {showSuggestion ?
            <>
              <h2 className="text-xl font-bold mb-4">Up Next</h2>
              <div className="space-y-4 overflow-scroll">
                {!selectedAudio.category
                  ? suggestions.map((audio, index) => (
                    <SuggestCard
                      key={index}
                      title={audio?.title}
                      image={audio?.imageUrl.fields.file.url}
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
              </>
              : 
              <div className="border flex flex-col">
                <h2 className="text-xl  font-bold mb-4">Up Next</h2>
                <div className="space-y-4 h-full border text-sm flex flex-col justify-center items-center ">
                  <h3 className="text-[1rem]">
                    You&lsquo;re all caught up
                    </h3>
                    <img className="h-20"  src={empty.src}/>
                  <Link href="/messages">
                  <button className="mt-0 btn bg-primary text-white">
                    Explore more messages
                  </button>
                  </Link>
                  <Link href="/articlesgi">
                  <button className="underline p-0 m-0">
                    Explore other content
                  </button>
                  </Link>
                  </div>
                </div>
                }
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
      <div className=" flex   overflow-hidden rounded-full">
        <img src={image} width={100}  className="rounded-full" alt={title} />
      </div>
      <div className="ml-2">
        <h3 className="text-xs ">{title}</h3>
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
