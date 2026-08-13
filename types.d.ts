type ShopProps = {
  id?: string;
  image: string;
  title: string;
  price: string;
  rating?: string;
  createdAt?: string;
  availableQty?: string;
};
type StoreItem = {
  category: string;
  image: string;
  image_url: { fields: { file: { url: string } } };
  price: number;
  rating: number;
  title: string;
  artist: string;
  lyrics: any;
  media: any;
};
type Article = {
  id?: string;
  title: string;
  content: any;
  image: string;
  image_url: any;
  createdAt?: string;
};

type Poem = {
  id?: string;
  title?: string;
  image?: string;
  content?: any;
  createdAt?: string;
  scripture?: any;
  updatedAt?: string;
  author?: string;
  categoryId?: string;
  image_url: any;
};
/** Resolved Contentful Asset, or an unresolved Link `{ sys: { type, id, linkType } }`. */
type AudioFile = {
  sys?: { type: string; id: string; linkType?: string };
  fields?: {
    description?: string;
    title?: string;
    file?: {
      contentType?: string;
      details?: unknown;
      filename?: string;
      url?: string;
    };
  };
};
type Message = {
  audio: any;
  image: string | any;
  /** For series entries: ordered Asset links — each element is one sermon in the series. */
  audio_file: AudioFile[];
  imageUrl: string | any;
  preacher: string;
  /** Present on series hub entries; absent on standalone messages. */
  category: string;
  title: string;
};

type Podcast = {
  title: string;
  category?: string;
  imageUrl?: string | any;
  image?: string | any;
  episodeCount?: number;
  episodes?: unknown[];
  audio?: { fields?: { file?: { url?: string } } } | string;
};

type PoemForm = Pick<Poem, "title" | "content" | "image" | "scripture">;
interface PoemModal {
  showModal: any;
  onCancel: () => void;
  handleSubmit?: (values: any) => void;
  poemInfo?: PoemForm;
  isSubmitting?: boolean;
}

type AccountDetailType = {
  bank: string;
  accountNo: string;
  accountName: string;
  currency: string;
};

type Music = {
  artiste: string;
  audio: AudioFile;
  image: string;
  imageUrl: AudioFile;
  lyrics: any;
  title: string;
};

type Artiste = {
  bio: any;
  image: string;
  imageUrl: { fields: AudioFile };
  name: string;
};

declare module "*.mp3";
