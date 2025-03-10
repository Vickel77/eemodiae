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
import { ministryAccounts, personalAccounts } from "../../util/mockData";

const publicKey = "pk_live_70d339bdc510a179071e3b37d842c89d8327db9a";

const copyText = (url: any) => {
  navigator.clipboard.writeText(url + "");
  toast("Account details copied");
};

export default function Index() {
  const [view, setView] = useState<number>(1);
  const [personalView, setPersonalView] = useState<number>(1);

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
              view === 3 && <ViewThree setView={setView} copyText={copyText} />
            )}
          </section>

          <section className=" text-left min-w-[350px] md:min-w-[500px]  bg-[#ffffffdd] shadow-xl p-5 rounded-xl border-[1px] border-primary relative pt-10">
            <div className=" text-center w-[90%] md:w-[70%] bg-primary rounded-full px-6 py-1 text-white  shadow-xl absolute -top-5 left-[50%] translate-x-[-50%]">
              <h4 className="font-bold">Prophet Offering</h4>
            </div>
            {personalView === 1 ? (
              <>
                <button
                  onClick={() => setPersonalView(2)}
                  className="btn flex gap-2 items-center"
                >
                  <MdSend />
                  Pay with Transfer
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setPersonalView(1)}
                  className="flex gap-2 items-center rounded-lg border-1 border-primary text-sm mb-5"
                >
                  <MdArrowLeft />
                  Back
                </button>
                {personalAccounts.map(
                  (account: AccountDetailType, index: number) => (
                    <AccountDetail key={index} details={account} />
                  )
                )}
                <div className="text-sm">
                  <p>
                    Swift code: <b>ZEIBNGLA</b>{" "}
                  </p>
                  <p>
                    Sort code: <b>057080219</b>
                  </p>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}

const ViewOne = ({ setView }: { setView: any }) => {
  return (
    <div className="flex  h-full items-center justify-center">
      {/* <button
        onClick={() => setView(1)}
        className="flex gap-2 items-center rounded-lg border-1 border-primary px-3 mb- text-sm5 mb-5"
      >
        <MdArrowLeft />
        Back
      </button> */}
      <div className=" flex flex-wrap gap-3 ">
        <button
          onClick={() => setView(2)}
          className="btn flex gap-2 items-center"
        >
          <MdPayment />
          Paystack
        </button>
        <button
          onClick={() => setView(3)}
          className="btn flex gap-2 items-center"
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
  const [hasError, setHasError] = useState<boolean>(false);

  const componentProps = {
    email,
    amount: amount * 100,
    publicKey,
    text: "Pay Now",
    onSuccess: () => {
      alert("God Bless you!!");
    },
    onClose: () => { },
  };

  const notFilled = amount === 0 || email === "";

  return (
    <div>
      <button
        onClick={() => setView(1)}
        className="flex gap-2 items-center rounded-lg border-1 border-primary text-sm mb-5"
      >
        <MdArrowLeft />
        Back
      </button>

      <form
        onSubmit={(e) => e.preventDefault()}
        action=""
        className="flex flex-col justify-center items-center"
      >
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
      <div className="mt-5 flex flex-col items-center">
        {notFilled && (
          <p className="text-red-600 font-semibold text-xs mb-2">
            Kindly fill out all fields to proceed
          </p>
        )}
        <button
          onClick={(e) => {
            if (amount === 0 || email === "") {
              setHasError(true);
              e.stopPropagation();
              return;
            }
          }}
          disabled={amount === 0 || email === ""}
          // type="submit"
          className="btn bg-primary text-white flex justify-center "
        >
          <PaystackButton {...componentProps} />
        </button>
      </div>
    </div>
  );
};

const ViewThree = ({
  copyText,
  setView,
}: {
  copyText: (e: string) => void;
  setView: any;
}) => {
  return (
    <div>
      <button
        onClick={() => setView(1)}
        className="flex gap-2 items-center rounded-lg border-1 border-primary   text-sm mb-5"
      >
        <MdArrowLeft />
        Back
      </button>
      {ministryAccounts.map((account: AccountDetailType, index: number) => (
        <AccountDetail key={index} details={account} />
      ))}

      <div className="text-sm">
        <p>
          Swift code: <b>GTBINGLA</b>{" "}
        </p>
        <p>
          Sort code: <b> 058083273</b>
        </p>
      </div>
    </div>
  );
};

const AccountDetail = ({ details }: { details: AccountDetailType }) => {
  return (
    <div className="mb-5 text-sm ">
      <div className="flex justify-between">
        <div className="inline-flex border-[1px] border-primary bg-primaryAccent text-primary  px-2  text-xs  rounded-full">
          {details?.currency}
        </div>
      </div>

      <span className="flex justify-between items-center">
        <p className="text-2xl font-bold">{details?.accountNo}</p>
        <MdCopyAll
          className="hover:cursor-pointer"
          onClick={() => copyText(details.accountNo)}
          size={20}
          color="3624A7"
        />
      </span>
      <p className="text-xs opacity-50">{details?.bank}</p>
      {/* <p className="">{details.accountName}</p> */}
    </div>
  );
};
