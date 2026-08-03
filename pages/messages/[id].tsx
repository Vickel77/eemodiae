import { useRouter } from "next/router";
import MessagesPage from "../../components/Messages/MessagesPage";
import { cleanString } from "../../util/normalizeAndCompare";

export default function MessageDetail() {
  const router = useRouter();
  const { id } = router.query;
  const slug = typeof id === "string" ? cleanString(id) : null;

  return <MessagesPage initialSlug={slug} initialKind="message" />;
}
