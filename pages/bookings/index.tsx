"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import pstEmma from "../../assets/pst-emaa.png";
import Navbar from "../../components/Navbar";
import { MdArrowLeft } from "react-icons/md";
import { PopupButton } from "react-calendly";

export default function Bookings() {
  const [showAppointmentOptions, setShowAppointmentOptions] = useState(false);
  const [showCalendly, setShowCalendly] = useState(false);
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
    window.location.href =
      "mailto:admin@example.com?subject=Speaking Engagement Inquiry";
  };

  const handleOnlineClick = () => {
    setShowCalendly(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Navbar />
      <div className="fixed bottom-0 right-0">
        <Image placeholder="blur" src={pstEmma} alt="" className="left-img" />
      </div>
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-4 text-primary text-center">
          Bookings
        </h1>

        {/* Main Options */}
        <div className="space-y-4">
          {!showAppointmentOptions && (
            <div className="relative group">
              <button
                onClick={handleAppointmentsClick}
                className="w-full py-2 border border-primary text-primary rounded-lg"
              >
                Appointments
              </button>
              <span className="absolute top-full z-50 left-1/2  mb-2 p-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                Choose between online or offline appointments.
              </span>
            </div>
          )}

          {!showAppointmentOptions && (
            <div className="relative group">
              <button
                onClick={handleSpeakingEngagementClick}
                className="w-full py-2 border border-primary text-primary rounded-lg "
              >
                Speaking Engagement
              </button>
              <span className="absolute top-full left-1/2  mb-2 p-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                Send an email to inquire about speaking engagements.
              </span>
            </div>
          )}

          {/* Appointments Options */}
          {showAppointmentOptions && (
            <div className="space-y-4 ">
              <button
                onClick={() => setShowAppointmentOptions(false)}
                className="text-sm flex gap-2 items-center rounded-lg text-primary  mb-5"
              >
                <MdArrowLeft />
                Back
              </button>
              {/* <button onClick={handleOnlineClick}>Online</button> */}
              <PopupButton
                url="https://calendly.com/kelechialigwo77"
                className="w-full py-2 bg-primary text-white rounded-lg"
                /*
                 * react-calendly uses React's Portal feature (https://reactjs.org/docs/portals.html) to render the popup modal. As a result, you'll need to
                 * specify the rootElement property to ensure that the modal is inserted into the correct domNode.
                 */
                rootElement={rootElement}
                text="Online"
              />
              <button
                disabled
                className="w-full py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed"
              >
                Offline
              </button>

              {/* Calendly UI (Simple Example) */}
              {showCalendly && (
                <div className="mt-4 p-4 border border-gray-300 rounded-lg">
                  <h2 className="text-xl font-bold">Select a time</h2>
                  {/* Replace this with actual Calendly or custom calendar UI */}
                  <p className="mt-2 text-gray-700">
                    Select a time between Monday, Wednesday, and Friday from 10
                    AM to 9 PM.
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
      </div>
    </div>
  );
}
