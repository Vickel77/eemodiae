import React, { useState } from "react";
import image from "../../assets/give-bg.jpg";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import {
  MdArrowLeft,
  MdCopyAll,
  MdFlight,
  MdPayment,
  MdSend,
} from "react-icons/md";
import { toast } from "react-toastify";
import { PaystackButton } from "react-paystack";

const publicKey = "pk_live_70d339bdc510a179071e3b37d842c89d8327db9a";

export default function Index() {
  const copyUrl = (url: any) => {
    navigator.clipboard.writeText(url + "");
    toast("Account details copied");
  };

  const [view, setView] = useState<number>(1);

  return (
    <div>
      <Navbar />
      <div
        style={{
          background: `-webkit-radial-gradient(#3624A7aa, #3624A7aa 70%), url(${image.src})`,
          backgroundAttachment: "fixed",
          backgroundPosition: "center center",
          backgroundSize: "cover",
        }}
        className="text-black w-full text-center pb-20 "
      >
        <header className="w-full py-14 text-white">
          <h1>GIVE</h1>
          <div className="w-[400px] m-auto">
            <p className="text-sm">
              Gather my saints together unto me; those that have made a covenant
              with me by sacrifice
            </p>
            <small>Psalm 50:5</small>
          </div>
        </header>

        <div className=" inline-flex justify-center flex-wrap  w-full gap-20 px-10 ">
          <section className=" text-left min-w-[350px] md:min-w-[500px] bg-[#ffffffdd] shadow-xl p-5 rounded-xl border-[1px] border-primary relative pt-10">
            <div className="  text-center w-[90%] md:w-[70%] bg-primary rounded-full px-6 py-1 text-white shadow-xl absolute -top-5 left-[50%] translate-x-[-50%]">
              <h4 className="font-bold">Ministry Account</h4>
            </div>
            {view === 1 ? (
              <ViewOne setView={setView} />
            ) : view === 2 ? (
              <ViewTwo setView={setView} />
            ) : (
              view === 3 && <ViewThree setView={setView} copyUrl={copyUrl} />
            )}
          </section>

          <section className=" text-left min-w-[350px] md:min-w-[500px]  bg-[#ffffffdd] shadow-xl p-5 rounded-xl border-[1px] border-primary relative pt-10">
            <div className=" text-center w-[90%] md:w-[70%] bg-primary rounded-full px-6 py-1 text-white  shadow-xl absolute -top-5 left-[50%] translate-x-[-50%]">
              <h4 className="font-bold">Personal Account</h4>
            </div>
            <div className="mb-5 text-sm">
              <p>Naira Account</p>
              <span className="flex justify-between">
                <p className="text-2xl font-bold">0221223124</p>
                <MdCopyAll
                  className="hover:cursor-pointer"
                  onClick={() => copyUrl(`0221223124`)}
                  size={20}
                  color="3624A7"
                />
              </span>
              <p>Guaranteed Trust Bank</p>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}

const ViewOne = ({ setView }: { setView: any }) => {
  return (
    <div>
      <button
        onClick={() => setView(1)}
        className="flex gap-2 items-center rounded-lg border-1 border-primary px-3 mb- text-sm5 mb-5"
      >
        <MdArrowLeft />
        Back
      </button>
      <div className=" flex ">
        <button
          onClick={() => setView(2)}
          className="btn mr-5 flex gap-2 items-center"
        >
          <MdPayment />
          Paystack
        </button>
        <button
          onClick={() => setView(3)}
          className="btn mr-5 flex gap-2 items-center"
        >
          <MdSend />
          Pay with Transfer
        </button>
      </div>
    </div>
  );
};

const ViewTwo = ({ setView }: { setView: any }) => {
  const [email, setEmail] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);

  const componentProps = {
    email,
    amount: amount * 100,
    publicKey,
    text: "Pay Now",
    onSuccess: () => {
      alert("Thanks for doing business with us! Come back soon!!");
    },
    onClose: () => {},
  };

  return (
    <div>
      <button
        onClick={() => setView(1)}
        className="flex gap-2 items-center rounded-lg border-1 border-primary px-3 mb- text-sm5 mb-5"
      >
        <MdArrowLeft />
        Back
      </button>
      <form action="">
        <input
          className="bg-white block w-full mb-5 "
          type="email"
          name="email"
          placeholder="Email"
          required
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="bg-white block w-full"
          type="number"
          name="amount"
          placeholder="Amount"
          required
          onChange={(e) => setAmount(+e.target.value!)}
        />
      </form>
      <button
        onClick={() => {
          if (amount === 0 || email === "") {
            return;
          }
        }}
        type="submit"
        className="btn"
      >
        <PaystackButton {...componentProps} />
      </button>
    </div>
  );
};

const ViewThree = ({
  copyUrl,
  setView,
}: {
  copyUrl: (e: string) => void;
  setView: any;
}) => {
  return (
    <div>
      <button
        onClick={() => setView(1)}
        className="flex gap-2 items-center rounded-lg border-1 border-primary px-3 mb- text-sm5 mb-5"
      >
        <MdArrowLeft />
        Back
      </button>
      <div className="mb-5 text-sm">
        <p>Naira Account</p>
        <span className="flex justify-between">
          <p className="text-2xl font-bold">0221223124</p>
          <MdCopyAll
            className="hover:cursor-pointer"
            onClick={() => copyUrl(`0221223124`)}
            size={20}
            color="3624A7"
          />
        </span>
        <p>Guaranteed Trust Bank</p>
      </div>
      <div className="mb-5 text-sm">
        <p>Dollar Account</p>
        <span className="flex justify-between">
          <p className="text-2xl font-bold">0022060685 Naira Account</p>
          <MdCopyAll
            className="hover:cursor-pointer"
            onClick={() => copyUrl(`0221223124`)}
            size={20}
            color="3624A7"
          />
        </span>
        <p>Guaranteed Trust Bank</p>
      </div>
      <div className="mb-5 text-sm">
        <p>Pound Account</p>
        <span className="flex justify-between">
          <p className="text-2xl font-bold">0221223124</p>
          <MdCopyAll
            className="hover:cursor-pointer"
            onClick={() => copyUrl(`0221223124`)}
            size={20}
            color="3624A7"
          />
        </span>
        <p>Guaranteed Trust Bank</p>
      </div>
    </div>
  );
};
