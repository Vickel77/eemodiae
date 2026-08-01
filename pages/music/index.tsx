import { useRouter } from "next/router";
import MusicPage from "../../components/Music/MusicPage";

export default function MusicIndex() {
  const router = useRouter();
  const { album } = router.query;
  const albumId = typeof album === "string" ? album : null;

  return <MusicPage initialView={albumId ? "album" : "gallery"} initialId={albumId} />;
}
