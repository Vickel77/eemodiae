import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import useContentful from "../../hooks/useContentful";
import image from "../../assets/book1.png";
import Share from "../../components/Share";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const AudioPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const { getMessages, messages } = useContentful();

  useEffect(() => {
    getMessages();
  }, []);

  // Find the selected audio based on the ID from the URL
  const selectedAudio: Message | undefined = messages?.find(
    (audio, index) => audio.title.toLowerCase() === String(id)?.toLowerCase()
  );

  if (!selectedAudio) {
    return <div>Audio not found</div>;
  }

  // Filter out the current audio from suggestions
  const suggestions = messages
    ?.filter(
      (audio, index) => audio.title.toLowerCase() !== String(id)?.toLowerCase()
    )
    .slice(0, 5);

  const _image = selectedAudio?.imageUrl?.fields?.file?.url ?? image.src;

  return (
    <>
      <div className="min-h-screen bg-gray-100 p-5 text-primary">
        <Navbar />
        <div className="container mx-auto my-10">
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

export default AudioPage;
