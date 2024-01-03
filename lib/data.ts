import p1 from "../assets/p1.png";
import p2 from "../assets/p2.png";
import p3 from "../assets/p3.png";
import book1 from "../assets/book1.png";
import book2 from "../assets/book2.png";
import book3 from "../assets/book3.png";
import book4 from "../assets/book4.png";
import { Poem } from "../components/PeomCard";

const poems: Poem[] = [
  {
    id: "1",
    content: `<p> The protagonist is the most important character in a story, around whom the plot revolves.
      They are usually the hero or champion of a particular cause or idea, and their actions and decisions drive the story forward.
      Similarly, in the Bible, Christ Jesus is the central and most significant theme. Every other character, event, and concept finds its meaning in connection to Him. 
      ... Jesus Christ himself being the chief corner stone; In whom all the building fitly framed together groweth unto an holy temple in the Lord (Eph 2:20-21). 
      This means that without Jesus, the Bible would be incomplete and lacking its essential message of redemption and hope.</p>`,
    createdAt: new Date().toString(),
    image: p1.src,
    title: "Faith over fear",
    scripture:
      "<b>Eph 5:25</b> <p> Husbands, Love your wives, even as Christ loved the church, & gave himself for it. </p>",
  },
  {
    id: "2",
    content: "",
    createdAt: new Date().toString(),
    image: p2.src,
    title: "Success Secrets",
    scripture:
      "<b>Eph 5:25</b> <p> Husbands, Love your wives, even as Christ loved the church, & gave himself for it. </p>",
  },
  {
    id: "3",
    content: "",
    createdAt: new Date().toString(),
    image: p3.src,
    title: "Next Level",
    scripture:
      "<b>Eph 5:25</b> <p> Husbands, Love your wives, even as Christ loved the church, & gave himself for it. </p>",
  },
  {
    id: "4",
    content: "",
    createdAt: new Date().toString(),
    image: p1.src,
    title: "Faith over fear",
    scripture:
      "<b>Eph 5:25</b> <p> Husbands, Love your wives, even as Christ loved the church, & gave himself for it. </p>",
  },
  {
    id: "5",
    content: "",
    createdAt: new Date().toString(),
    image: p2.src,
    title: "Success Secrets",
    scripture:
      "<b>Eph 5:25</b> <p> Husbands, Love your wives, even as Christ loved the church, & gave himself for it. </p>",
  },
  {
    id: "6",
    content: "",
    createdAt: new Date().toString(),
    image: p3.src,
    title: "Next Level",
    scripture:
      "<b>Eph 5:25</b> <p> Husbands, Love your wives, even as Christ loved the church, & gave himself for it. </p>",
  },
];

export const articles: Article[] = [
  {
    id: "1",
    content: `<p> The protagonist is the most important character in a story, around whom the plot revolves.

 They are usually the hero or champion of a particular cause or idea, and their actions and decisions drive the story forward.

Similarly, in the Bible, Christ Jesus is the central and most significant theme. Every other character, event, and concept finds its meaning in connection to Him. 

... Jesus Christ himself being the chief corner stone; In whom all the building fitly framed together groweth unto an holy temple in the Lord (Eph 2:20-21). 

This means that without Jesus, the Bible would be incomplete and lacking its essential message of redemption and hope.</p>`,
    image: p1.src,
    title: "Christ Jesus The Protagonist",
    createdAt: new Date().toString(),
  },
  {
    id: "2",
    content: `<p> The protagonist is the most important character in a story, around whom the plot revolves.

 They are usually the hero or champion of a particular cause or idea, and their actions and decisions drive the story forward.

Similarly, in the Bible, Christ Jesus is the central and most significant theme. Every other character, event, and concept finds its meaning in connection to Him. 

... Jesus Christ himself being the chief corner stone; In whom all the building fitly framed together groweth unto an holy temple in the Lord (Eph 2:20-21). 

This means that without Jesus, the Bible would be incomplete and lacking its essential message of redemption and hope.</p>`,
    image: p2.src,
    title: "Success Secrets",
    createdAt: new Date().toString(),
  },
  {
    id: "3",
    content: `<p> The protagonist is the most important character in a story, around whom the plot revolves.

 They are usually the hero or champion of a particular cause or idea, and their actions and decisions drive the story forward.

Similarly, in the Bible, Christ Jesus is the central and most significant theme. Every other character, event, and concept finds its meaning in connection to Him. 

... Jesus Christ himself being the chief corner stone; In whom all the building fitly framed together groweth unto an holy temple in the Lord (Eph 2:20-21). 

This means that without Jesus, the Bible would be incomplete and lacking its essential message of redemption and hope.</p>`,
    image: p3.src,
    title: "Next Level",
    createdAt: new Date().toString(),
  },
  {
    id: "4",
    content: `<p> The protagonist is the most important character in a story, around whom the plot revolves.

 They are usually the hero or champion of a particular cause or idea, and their actions and decisions drive the story forward.

Similarly, in the Bible, Christ Jesus is the central and most significant theme. Every other character, event, and concept finds its meaning in connection to Him. 

... Jesus Christ himself being the chief corner stone; In whom all the building fitly framed together groweth unto an holy temple in the Lord (Eph 2:20-21). 

This means that without Jesus, the Bible would be incomplete and lacking its essential message of redemption and hope.</p>`,
    image: p1.src,
    title: "Faith over fear",
    createdAt: new Date().toString(),
  },
  {
    id: "5",
    content: `<p> The protagonist is the most important character in a story, around whom the plot revolves.

 They are usually the hero or champion of a particular cause or idea, and their actions and decisions drive the story forward.

Similarly, in the Bible, Christ Jesus is the central and most significant theme. Every other character, event, and concept finds its meaning in connection to Him. 

... Jesus Christ himself being the chief corner stone; In whom all the building fitly framed together groweth unto an holy temple in the Lord (Eph 2:20-21). 

This means that without Jesus, the Bible would be incomplete and lacking its essential message of redemption and hope.</p>`,
    image: p2.src,
    title: "Success Secrets",
    createdAt: new Date().toString(),
  },
  {
    id: "6",
    content: `<p> The protagonist is the most important character in a story, around whom the plot revolves.

 They are usually the hero or champion of a particular cause or idea, and their actions and decisions drive the story forward.

Similarly, in the Bible, Christ Jesus is the central and most significant theme. Every other character, event, and concept finds its meaning in connection to Him. 

... Jesus Christ himself being the chief corner stone; In whom all the building fitly framed together groweth unto an holy temple in the Lord (Eph 2:20-21). 

This means that without Jesus, the Bible would be incomplete and lacking its essential message of redemption and hope.</p>`,
    image: p3.src,
    title: "Next Level",
    createdAt: new Date().toString(),
  },
];

export const books: ShopProps[] = [
  {
    id: "1",
    title: "Power of Faith",
    image: book1.src,
    price: "1000",
    availableQty: "2",
    createdAt: new Date().toDateString(),
    rating: "3",
  },
  {
    id: "2",
    title: "Power of Faith",
    image: book2.src,
    price: "1200",
    availableQty: "2",
    createdAt: new Date().toDateString(),
    rating: "3",
  },
  {
    id: "3",
    title: "Power of Faith",
    image: book3.src,
    price: "2000",
    availableQty: "2",
    createdAt: new Date().toDateString(),
    rating: "3",
  },
  {
    id: "4",
    title: "Power of Faith",
    image: book4.src,
    price: "3000",
    availableQty: "2",
    createdAt: new Date().toDateString(),
    rating: "3",
  },
];

export default poems;
