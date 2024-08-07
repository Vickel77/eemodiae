import React, { useCallback, useEffect, useState } from "react";

import { MdArrowLeft } from "react-icons/md";
import Navbar from "../../components/Navbar";
import { useRouter } from "next/router";
import Footer from "../../components/Footer";
import useContentful from "../../hooks/useContentful";
import MessageCard from "../../components/MessageCard";
import CategoryCard from "../../components/MessageCard/CategoryCard";

// understanding biblical Spirituality
// Understanding the anioninting
// Ever winning faith
// Ingredients of a powerful declaration

export default function Messages() {
  const router = useRouter();

  const { getMessages, messages } = useContentful();

  useEffect(() => {
    getMessages();
  }, []);

  console.log({ messages });

  const _categories: { [key: string]: Message[] } = {};

  const [categories, setCategories] = useState<string[]>([]);

  const initMessages = useCallback(() => {
    messages?.map((message) => {
      if (categories.includes(message.category)) {
        return;
      }
      if (message.category) {
        setCategories((prev) => [...prev, message.category]);
      }

      // if (message.category === "") return;
      // _categories[message.category] = [..._categories[message.category], message];

      // if (Object.keys(_categories).includes(message.category)) {
      //   _categories[message.category] = [
      //     ..._categories[message.category],
      //     message,
      //   ];
      // } else {
      //    _categories[message.category] = [
      //      ..._categories[message.category],
      //      message,
      //    ];
      // }
    });
  }, [messages]);

  useEffect(() => {
    initMessages();
  }, [messages]);

  console.log("hm >>  ", categories);

  return (
    <div>
      <div className="mt-[5rem] w-[70%] m-auto text-primary  mb-10">
        <Navbar />
        <button
          onClick={() => router.back()}
          className="flex gap-2 items-center rounded-lg border-1 border-primary px-3 mb-5"
        >
          <MdArrowLeft />
          Back
        </button>
        <h2 className="font-bold mb-5">MESSAGES</h2>
        {/* <div className="top-bar">
        <input placeholder="Search" className="search-input" type="text" />
        <button className="btn">SEARCH</button>
      </div> */}
        {/* <audio controls autoPlay>
        <source src={audio} />
      </audio> */}
        <div className=" grid grid-cols-4">
          {categories.map((category, idx) => {
            const categoryMessages = messages?.filter(
              (m) => m.category === category
            );
            console.log({ categoryMessages });
            return (
              <CategoryCard
                key={idx}
                category={{
                  title: category,
                  image: categoryMessages?.[0].imageUrl.fields.file.url!,
                }}
                categoryMessage={{ ...categoryMessages?.[0]! }}
              />
            );
          })}
        </div>
        <div className="bg-primary h-[1px] w-full opacity-50 my-5" />
        <div className=" flex gap-5 flex-wrap justify-center md:justify-start">
          {messages
            ?.filter((m) => m?.category === undefined)
            .map((message, idx) => (
              <>
                <MessageCard message={message} key={idx} />
              </>
            ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
