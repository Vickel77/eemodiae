import {
  DetailedHTMLProps,
  LinkHTMLAttributes,
  useEffect,
  useState,
} from "react";
import { MdCopyAll, MdFmdGood } from "react-icons/md";
import { toast } from "react-toastify";
import {
  EmailIcon,
  EmailShareButton,
  FacebookIcon,
  TwitterIcon,
  InstapaperIcon,
  WhatsappIcon,
  LinkedinIcon,
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
} from "react-share";

const Share = ({
  title,
  text,
  absolute,
}: {
  title?: string;
  text?: string | any;
  absolute?: boolean;
}) => {
  const [isShareSupported, setIsShareSupported] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  // const sharableText = text?.replace(/<[^>]*>/g, "");
  const sharableText = "text";
  const sharableTitle = title?.replace(/<[^>]*>/g, "");

  const checkShareSupport = () => {
    if (navigator.share!) {
      setIsShareSupported(true);
    } else setIsShareSupported(false);
  };
  useEffect(checkShareSupport, []);

  if (typeof window == "undefined") return <></>;
  // let url = window.location.href;
  const canonical:
    | DetailedHTMLProps<LinkHTMLAttributes<HTMLLinkElement>, HTMLLinkElement>
    | any = document.querySelector("link[rel=canonical]");
  let url = canonical ? canonical.href : document.location.href;

  const shareDetails = { url, sharableTitle, sharableText };
  function handleCopy() {
    try {
      const el = document.createElement("input");
      el.value = window.location.href;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      toast("Url copied");
      setCopied(true);
    } catch (error) {
      console.error("Not copied" + error);
    }
  }

  const handleShare = async () => {
    try {
      await navigator.share(shareDetails).then(() => {
        toast("Post shared successfully!");
      });
    } catch (error) {
      toast("Post not shared" + error);
    }
  };
  return (
    <div>
      <div>
        {!absolute && (
          <h3 className="inline text-lg bg-primaryAccent rounded-full text-primary px-2 py-1 mb-5">
            Share with friends
          </h3>
        )}
        {isShareSupported ? (
          <img onClick={() => handleShare()} src="/share.png" width="45" />
        ) : (
          <div
            className={`static mt-3 ${
              absolute ? "fixed flex-col" : ""
            }  top-[40%] right-0  flex flex-wrap  mb-10`}
          >
            <EmailShareButton
              url={url}
              title={sharableTitle}
              className="hover:scale-110 text-sm transition-[0.3s]"
            >
              <EmailIcon size={50} />
            </EmailShareButton>
            <FacebookShareButton
              url={url}
              title={sharableTitle}
              className="hover:scale-110 text-sm transition-[0.3s]"
            >
              <FacebookIcon size={50} />
            </FacebookShareButton>
            <TwitterShareButton
              url={url}
              title={sharableTitle}
              className="hover:scale-110 text-sm transition-[0.3s]"
            >
              <TwitterIcon size={50} />
            </TwitterShareButton>
            <LinkedinShareButton
              url={url}
              title={sharableTitle}
              className="hover:scale-110 text-sm transition-[0.3s]"
            >
              <LinkedinIcon size={50} />
            </LinkedinShareButton>
            <WhatsappShareButton
              url={url}
              title={sharableTitle}
              className="hover:scale-110 text-sm transition-[0.3s]"
            >
              <WhatsappIcon size={50} />
            </WhatsappShareButton>
            {/* {copied ? (
              <div onClick={handleCopy}>
                <MdCopyAll />
                <p> copied</p>
              </div>
            ) : (
              <div onClick={handleCopy}>
                {" "}
                <MdFmdGood />
              </div>
            )} */}
          </div>
        )}
      </div>
    </div>
  );
};

export default Share;
