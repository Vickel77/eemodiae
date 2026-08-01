import { useRouter } from "next/router";
import MusicPage from "../../../components/Music/MusicPage";

export default function MusicArtiste() {
  const router = useRouter();
  const { artiste } = router.query;
  const name = typeof artiste === "string" ? decodeURIComponent(artiste) : null;

  return <MusicPage artistName={name} />;
}
