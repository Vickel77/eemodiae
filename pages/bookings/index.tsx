"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import pstEmma from "../../assets/pst-emaa.png";
import Navbar from "../../components/Navbar";
import { MdArrowLeft } from "react-icons/md";
import { PopupButton } from "react-calendly";
import EventFormModal from "../../components/EventForm/EventFormModal";
import Footer from "../../components/Footer";
import EventForm from "../../components/EventForm";
import Head from "next/head";
import mic from "../../assets/microphone.png";
import calender from "../../assets/calendar.png";

export default function Bookings() {
  const [showAppointmentOptions, setShowAppointmentOptions] = useState(false);
  const [showCalendly, setShowCalendly] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState<boolean>(false);
  const [rootElement, setRootElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Ensure this runs on the client-side to access `document`
    setRootElement(document.getElementById("__next"));
  }, []);

  // Avoid rendering until `rootElement` is set
  if (!rootElement) return null;

  const handleAppointmentsClick = () => {
    setShowAppointmentOptions(true);
    setShowCalendly(false);
  };

  const handleSpeakingEngagementClick = () => {
    setShowBookingForm(true);
    // window.location.href =
    //   "mailto:admin@example.com?subject=Speaking Engagement Inquiry";
  };

  const handleOnlineClick = () => {
    setShowCalendly(true);
  };

  return (
    <>
      <Head>
        <title>Bookings</title>
        <meta
          name="description"
          content="Book appointments and speaking engagements"
        />

        {/* Open Graph / Facebook */}

        <meta property="og:site_name" content="Eemodiae" />
        <meta property="og:title" content="Bookings" />
        <meta
          property="og:description"
          content="Book appointments and speaking engagements"
          key="description"
        />
        <meta
          property="og:image"
          content="https://res.cloudinary.com/dwgywtak8/image/upload/v1728428668/mmppbzvmceyiw4rc6j32.png"
        />
        <meta property="og:type" content="Bookings" />
        <meta property="og:image:alt" content={"Eemodiae Bookings"} />

        {/* Twitter */}

        <meta name="twitter:title" content="Bookings" />
        <meta
          name="twitter:description"
          content="Book appointments and speaking engagements"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@eemodiae" />
        <meta
          property="twitter:image"
          content="https://res.cloudinary.com/dwgywtak8/image/upload/v1728428668/mmppbzvmceyiw4rc6j32.png"
        />
        <meta property="og:image:alt" content={"Eemodiae Bookings"} />
      </Head>
      <Navbar />
      <div className=" booking-wrapper min-h-screen flex flex-col items-center justify-center bg-gray-100">
        {/* <div className="fixed bottom-0 right-0">
        <Image placeholder="blur" src={pstEmma} alt="" className="left-img" />
      </div> */}
        <div className="text-center">
          <h1 className="text-2xl font-bold mt-32  text-white text-center">
            Bookings
          </h1>
          <p>Book appointments and speaking engagements</p>
        </div>
        <div className=" p-8 rounded-xl w-full md:w-[60%] my-0 ">
          {/* Main Options */}
          <div className="flex gap-5 justify-center flex-wrap">
            {!showAppointmentOptions && !showBookingForm && (
              <div className="relative group">
                <button
                  onClick={handleAppointmentsClick}
                  className="w-[250px] flex text-md flex-col items-center gap-1 justify-center hover:scale-110 transition-[0.2s] bg-white hover:bg-primaryAccent   min-h-52  p-3  text-black rounded-lg"
                >
                  <img src={calender.src} alt="" width={50} />
                  Appointments
                  <span className=" top-full z-3 left-1/2   p-2 text-sm text-gray-500 bg-white  rounded-lg group-hover:opacity-100 transition-opacity">
                    Choose between online or offline appointments.
                  </span>
                </button>
              </div>
            )}

            {!showAppointmentOptions && !showBookingForm && (
              <div className="relative group">
                <button
                  onClick={handleSpeakingEngagementClick}
                  className="w-[250px] text-md flex flex-col items-center  gap-1 justify-center bg-white hover:bg-primaryAccent transition-[0.2s]  hover:scale-110  min-h-52 p-2  text-black rounded-lg "
                >
                  <img src={mic.src} alt="" width={50} />
                  Speaking Engagement
                  <span className="  top-full left-1/2   p-2 text-xs text-gray-500 bg-white rounded-lg  group-hover:opacity-100 transition-opacity">
                    Send an email to inquire about speaking engagements.
                  </span>
                </button>
              </div>
            )}

            {/* Appointments Options */}
            {showAppointmentOptions && (
              <div className="space-y-4  p-5 bg-white rounded-lg">
                <p className="text-primary text-xl font-bold mb-4">
                  Select appointment type
                </p>
                <button
                  onClick={() => setShowAppointmentOptions(false)}
                  className="text-sm flex gap-2 items-center rounded-lg text-primary  mb-5"
                >
                  <MdArrowLeft />
                  Back
                </button>
                <div className="flex gap-3">
                  {/* <button onClick={handleOnlineClick}>Online</button> */}
                  <PopupButton
                    url="https://calendly.com/kelechialigwo77"
                    className="w-full p-2 px-4 bg-primary text-white rounded-lg"
                    /*
                     * react-calendly uses React's Portal feature (https://reactjs.org/docs/portals.html) to render the popup modal. As a result, you'll need to
                     * specify the rootElement property to ensure that the modal is inserted into the correct domNode.
                     */
                    rootElement={rootElement}
                    text="Online"
                  />
                  <button
                    disabled
                    className="w-full p-2 px-4 bg-gray-400 text-white rounded-lg cursor-not-allowed"
                  >
                    Offline
                  </button>
                </div>
                {/* Calendly UI (Simple Example) */}
                {showCalendly && (
                  <div className="mt-4 p-4 border border-gray-300 rounded-lg">
                    <h2 className="text-xl font-bold">Select a time</h2>
                    {/* Replace this with actual Calendly or custom calendar UI */}
                    <p className="mt-2 text-gray-700">
                      Select a time between Monday, Wednesday, and Friday from
                      10 AM to 9 PM.
                    </p>
                    <div className="mt-4">
                      {/* Placeholder Calendar UI */}
                      <div className="text-center text-sm text-gray-500">
                        [Calendly UI goes here]
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          {showBookingForm && (
            <EventForm onPressBack={() => setShowBookingForm(false)} />
          )}
        </div>
        {/* <EventFormModal
          showModal={showBookingForm}
          onCancel={() => setShowBookingForm(false)}
        /> */}
      </div>
      <Footer hideBooking />
    </>
  );
}
