import p1 from "../assets/p1.png"
import p2 from "../assets/p2.png"
import p3 from "../assets/p3.png"
import book1 from "../assets/book1.png"
import book2 from "../assets/book2.png"
import book3 from "../assets/book3.png"
import book4 from "../assets/book4.png"
import { Poem } from "../components/PeomCard"

const poems: Poem[] = [
  {
    id:"1",
    content: "",
    createdAt: new Date().toString(),
    imageUrl:p1.src,
    title:"Faith over fear"
  },
  {
    id:"2",
    content: "",
    createdAt: new Date().toString(),
    imageUrl: p2.src,
    title:"Success Secrets"
  },
  {
    id:"3",
    content: "",
    createdAt: new Date().toString(),
    imageUrl:p3.src,
    title:"Next Level"
  },
  {
    id:"4",
    content: "",
    createdAt: new Date().toString(),
    imageUrl:p1.src,
    title:"Faith over fear"
  },
  {
    id:"5",
    content: "",
    createdAt: new Date().toString(),
    imageUrl: p2.src,
    title:"Success Secrets"
  },
  {
    id:"6",
    content: "",
    createdAt: new Date().toString(),
    imageUrl:p3.src,
    title:"Next Level"
  }

]

export const books:ShopProps[] = [
  {
    id:"1",
    title:"Power of Faith",
    image:book1.src,
    price:"1000",
    availableQty:"2",
    createdAt: new Date().toDateString(),
    rating:"3"
  },
  {
    id:"2",
    title:"Power of Faith",
    image:book2.src,
    price:"1200",
    availableQty:"2",
    createdAt: new Date().toDateString(),
    rating:"3"
  },
  {
    id:"3",
    title:"Power of Faith",
    image:book3.src,
    price:"2000",
    availableQty:"2",
    createdAt: new Date().toDateString(),
    rating:"3"
  },
  {
    id:"4",
    title:"Power of Faith",
    image:book4.src,
    price:"3000",
    availableQty:"2",
    createdAt: new Date().toDateString(),
    rating:"3"
  }
]

export default poems