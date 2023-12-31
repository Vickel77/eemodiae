type ShopProps = {
  id?: string;
  image: string;
  title: string;
  price: string;
  rating?: string;
  createdAt?: string;
  availableQty?: string;
};

type Article = {
  id?:string,
  title:string,
  content:string,
  image:string,
  createdAt:string

}

declare module "*.mp3"