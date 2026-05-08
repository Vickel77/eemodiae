import { useMemo } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { createClient } from "contentful";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { MdArrowLeft, MdDownload } from "react-icons/md";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import Share from "../../../components/Share";
import empty from "../../../assets/empty-state.png";
import image from "../../../assets/book1.png";
import normalizeAndCompare, { cleanString } from "../../../util/normalizeAndCompare";

type PodcastPlaybackItem = {
  title: string;
  description?: string;
  date?: string;
  imageUrl?: any;
  image?: any;
  audioUrl?: string;
};

type PodcastPlayerProps = {
  episodes: PodcastPlaybackItem[];
};

const client = createClient({
  space: "7rf3l1j0b9zd",
  accessToken: "lD4oHO4B6sURlPIVrmkoZthACYqHbsFQVc4uw6QhVHI",
});

const extractAudioUrl = (item: any): string | undefined => {
  const candidates = [
    item?.audio?.fields?.file?.url,
    item?.audio?.file?.url,
    item?.audio?.url,
    item?.fields?.audio?.fields?.file?.url,
    item?.fields?.audio?.file?.url,
    item?.fields?.audio?.url,
    item?.file?.url,
    item?.fields?.file?.url,
    item?.audioUrl,
  ];
  return candidates.find((value) => typeof value === "string" && value.length > 0);
};

const extractImageUrl = (item: any): string | undefined => {
  const candidates = [
    item?.imageUrl?.fields?.file?.url,
    item?.imageUrl?.url,
    item?.fields?.imageUrl?.fields?.file?.url,
    item?.fields?.imageUrl?.url,
    item?.image,
    item?.fields?.image,
  ];
  const value = candidates.find((candidate) => typeof candidate === "string" && candidate.length > 0);
  return value as string | undefined;
};

export default function PodcastPlayer({ episodes }: PodcastPlayerProps) {
  const router = useRouter();
  const { id } = router.query;
  const idValue = String(id ?? "");

  const selectedEpisode = useMemo(
    () => episodes.find((episode) => normalizeAndCompare(episode.title ?? "", idValue)),
    [episodes, idValue]
  );

  const selectedEpisodeIndex = useMemo(
    () => episodes.findIndex((episode) => normalizeAndCompare(episode.title ?? "", idValue)),
    [episodes, idValue]
  );

  const upNext =
    selectedEpisodeIndex >= 0
      ? episodes.filter((_, idx) => idx !== selectedEpisodeIndex).slice(0, 5)
      : [];

  if (!selectedEpisode || !selectedEpisode.audioUrl) {
    return (
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
          <div className="rounded-xl bg-white shadow-sm p-8 text-center">
            <p className="text-lg font-semibold mb-2">Podcast episode not found</p>
            <p className="text-gray-600 mb-4">This episode might be unavailable or missing audio.</p>
            <Link href="/messages/podcasts" className="text-primary underline">
              Browse all podcasts
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const selectedImage = extractImageUrl(selectedEpisode) ?? image.src;
  const canonicalUrl = `https://eemodiae.org/messages/podcasts/${cleanString(idValue)}`;

  return (
    <>
      <Head>
        <title>{selectedEpisode.title || "Eemodiae Podcast"}</title>
        <meta name="description" content={selectedEpisode.description || "Listen to Eemodiae podcast episodes"} />
        <link rel="canonical" href={canonicalUrl} />
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
            <div className="relative flex-1">
              <div
                style={{
                  backgroundImage: `url(${selectedImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: "blur(10px)",
                }}
                className="absolute inset-0 rounded-lg opacity-20"
              />
              <div className="relative bg-white bg-opacity-0 shadow-md rounded-lg p-6">
                <h1 className="text-2xl font-semibold mb-2">{selectedEpisode.title}</h1>
                {selectedEpisode.date && <p className="text-sm text-gray-600 mb-4">{selectedEpisode.date}</p>}
                <div className="relative h-[300px] rounded-lg w-full flex justify-center items-center overflow-hidden">
                  <img src={selectedImage} width="100%" className="rounded-lg" alt={selectedEpisode.title} />
                </div>
                <div className="mt-5 flex flex-wrap gap-5 items-center justify-center">
                  <AudioPlayer
                    src={selectedEpisode.audioUrl}
                    autoPlay
                    customAdditionalControls={[]}
                    layout="stacked-reverse"
                    customVolumeControls={[]}
                    style={{ width: "100%", backgroundColor: "transparent" }}
                    showDownloadProgress
                  />
                  <Share shareUrl={canonicalUrl} icon title={selectedEpisode.title} />
                  <button className="flex gap-3">
                    <Link
                      href={selectedEpisode.audioUrl}
                      className="hover:opacity-80 flex justify-center items-center gap-2"
                      onClick={(e) => {
                        e.preventDefault();
                        fetch(selectedEpisode.audioUrl as string)
                          .then((response) => response.blob())
                          .then((blob) => {
                            const blobURL = window.URL.createObjectURL(blob);
                            const link = document.createElement("a");
                            link.href = blobURL;
                            link.download = selectedEpisode.title || "podcast";
                            link.click();
                            window.URL.revokeObjectURL(blobURL);
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

            <div className="w-full md:w-[30%]">
              <h2 className="text-xl font-bold mb-4">Up Next</h2>
              {upNext.length > 0 ? (
                <div className="space-y-4 overflow-scroll">
                  {upNext.map((episode) => (
                    <div
                      key={episode.title}
                      className="flex items-center bg-white shadow-md rounded-lg p-3 cursor-pointer"
                      onClick={() =>
                        router.push(`/messages/podcasts/${encodeURIComponent(episode.title ?? "")}`)
                      }
                    >
                      <div className="overflow-hidden rounded-full">
                        <img
                          src={extractImageUrl(episode) ?? image.src}
                          width={100}
                          className="rounded-full"
                          alt={episode.title}
                        />
                      </div>
                      <div className="ml-2">
                        <h3 className="text-xs">{episode.title}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border flex flex-col p-4 items-center text-center bg-white rounded-lg">
                  <h3 className="text-[1rem] mb-2">You&apos;re all caught up</h3>
                  <img className="h-20 mb-3" src={empty.src} alt="Empty state" />
                  <Link href="/messages/podcasts" className="btn bg-primary text-white">
                    Explore more podcasts
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export async function getServerSideProps() {
  const entries = await client.getEntries({
    content_type: "eemodiaePodcast",
  });

  const podcasts = entries?.items?.map((item: any) => ({ ...item.fields })) ?? [];

  const episodes: PodcastPlaybackItem[] = podcasts.flatMap((podcast: any) => {
    const nestedEpisodes = Array.isArray(podcast?.episodes) ? podcast.episodes : [];
    const normalizedNested = nestedEpisodes.map((episode: any, index: number) => {
      const title =
        episode?.title ??
        episode?.name ??
        episode?.fields?.title ??
        `${podcast?.title ?? "Episode"} ${index + 1}`;
      return {
        title,
        description:
          episode?.description ?? episode?.summary ?? episode?.fields?.description ?? podcast?.description ?? "",
        date: episode?.date ?? episode?.publishedAt ?? episode?.fields?.date ?? "",
        imageUrl: episode?.imageUrl ?? episode?.fields?.imageUrl ?? podcast?.imageUrl,
        image: episode?.image ?? podcast?.image,
        audioUrl: extractAudioUrl(episode) ?? extractAudioUrl(podcast),
      };
    });

    const standaloneEpisode =
      extractAudioUrl(podcast) && podcast?.title
        ? [
            {
              title: podcast.title,
              description: podcast?.description ?? podcast?.summary ?? "",
              date: podcast?.date ?? podcast?.publishedAt ?? "",
              imageUrl: podcast?.imageUrl,
              image: podcast?.image,
              audioUrl: extractAudioUrl(podcast),
            },
          ]
        : [];

    return [...standaloneEpisode, ...normalizedNested];
  });

  return {
    props: { episodes },
  };
}
