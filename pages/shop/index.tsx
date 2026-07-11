import { useRouter } from "next/router";
import BookstorePage from "../../components/Shop/BookstorePage";

export default function ShopIndexPage() {
  const router = useRouter();
  const open = router.query.open;
  const initialOpenId = Array.isArray(open) ? open[0] : open;

  return <BookstorePage initialOpenId={initialOpenId} />;
}
