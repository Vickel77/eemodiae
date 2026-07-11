export type StoreLinks = {
  amazon?: string;
  kindle?: string;
  selar?: string;
  bambooks?: string;
  okadabooks?: string;
  other?: string;
};

export type StoreBook = {
  id: string;
  title: string;
  subtitle?: string;
  kicker?: string;
  category: string;
  description?: string;
  formats?: string[];
  priceUSD: number;
  priceNGN?: number;
  coverImage?: string;
  downloadUrl?: string;
  comingSoon?: boolean;
  peek?: string;
  links?: StoreLinks;
  otherLabel?: string;
};

export type StoreCourse = {
  id: string;
  title: string;
  track?: string;
  tone?: string;
  description?: string;
  modules?: number;
  hours?: number;
  level?: string;
  priceUSD: number;
  priceNGN?: number;
  accessUrl?: string;
  peek?: string;
  links?: StoreLinks;
  otherLabel?: string;
};

export type StoreConfig = {
  settings: {
    defaultCurrency: "USD" | "NGN";
    fxRate: number;
    supportEmail: string;
    externalConfigUrl?: string;
    booksPerPage: number;
    coursesPerPage: number;
  };
  payments: {
    paystackPublicKey?: string;
    flutterwavePublicKey?: string;
  };
  categories: string[];
  featuredId: string;
  books: StoreBook[];
  courses: StoreCourse[];
};

export type StoreItem = StoreBook | StoreCourse;
