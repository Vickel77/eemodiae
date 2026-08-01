import { useRouter } from "next/router";
import MusicPage from "../../components/Music/MusicPage";
import { cleanString } from "../../util/normalizeAndCompare";

export default function MusicDetail() {
  const router = useRouter();
  const { id } = router.query;
  const slug = typeof id === "string" ? cleanString(id) : null;

  return <MusicPage initialView="song" initialId={slug} />;
}
