import React from "react";
import audio from "../../assets/audio/worthy.mp3";
import { MdArrowLeft, MdDownload } from "react-icons/md";
import Navbar from "../../components/Navbar";
import { useRouter } from "next/router";
import Footer from "../../components/Footer";

export default function Messages() {
  const router = useRouter();
  return (
    <div>
      <div className="mt-[5rem] w-[60%] m-auto text-primary  mb-10">
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
        {[1, 2, 3, 2, 1, 2, 3].map((x, idx) => (
          <div
            key={idx}
            className="bg-white flex w-full justify-between items-center rounded-xl border-1 border-primary p-3 shadow-lg mb-5"
          >
            <div>
              Walking in Faith
              <br />
              <small className="opacity-50">Pst Emmanuel I. Emodiae</small>
            </div>
            <button className="flex gap-3">
              {/* <MdOutlineMonitorHeart /> */}
              <MdDownload size={30} />
            </button>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
}
