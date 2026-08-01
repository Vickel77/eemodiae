import { useEffect } from "react";
import { useRouter } from "next/router";
import PageLoader from "../../components/PageLoader";

export default function MessagesAllRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    router.replace("/messages?tab=messages");
  }, [router.isReady]);

  return <PageLoader />;
}
