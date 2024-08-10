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
  price: number;
  rating: number;
  title: string;
  artist: string;
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
type AudioFile = {
  fields: {
    description: string;
    title: string;
    file: {
      contentType: string;
      details: string;
      filename: string;
      url: string;
    };
  };
};
type Message = {
  audio: any;
  image: string | any;
  audio_file: AudioFile[];
  imageUrl: string | any;
  preacher: string;
  category: string;
  title: string;
};

type PoemForm = Pick<Poem, "title" | "content" | "image" | "scripture">;
interface PoemModal {
  showModal: any;
  onCancel: () => void;
  handleSubmit?: (values: any) => void;
  poemInfo?: PoemForm;
  isSubmitting?: boolean;
}

declare module "*.mp3";
