import React, { useState } from "react";
// import { toast, Toaster } from "react-hot-toast";
import { MdArrowLeft } from "react-icons/md";
import emailjs from "@emailjs/browser";
import { toast } from "react-toastify";
import checked from "../../assets/checked.png";
import { Loader } from "../PageLoader";
const PRIVATE_KEY = process.env.NEXT_PUBLIC_EJS_PUBLIC_KEY;
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EJS_TEMPLATE_ID;
const SERVICE_ID = process.env.NEXT_PUBLIC_EJS_SERVICE_ID;

const EventForm = ({ onPressBack }: { onPressBack?: () => void }) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccessful, setIsSuccessful] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    organisation: "",
    email: "",
    phone: "",
    website: "",
    socialMedia: "",
    eventName: "",
    natureOfEvent: "",
    otherEvent: "",
    country: "",
    state: "",
    address: "",
    time: "",
    additionalInfo: "",
  });

  const { firstName, lastName, email, ...rest } = formData;

  const templateParams = {
    from_name: `${formData.firstName} ${formData.lastName}`,
    from_email: formData.email,
    to_name: "Eemodiae",
    to_email: "eemodiaeweb@gmail.com",
    message: `
    FirstName: ${formData.firstName}\n
    LastName: ${formData.lastName}\n
    Name of Organisation: ${formData.organisation}\n
    Email: ${formData.email}\n
    Phone: ${formData.phone}\n
    Website: ${formData.website}\n
    Social Media: ${formData.socialMedia}\n
    Event Name: ${formData.eventName}\n
    Nature Of Event: ${formData.natureOfEvent}\n
    Other Event Name: ${formData.otherEvent}\n
    Country: ${formData.country}\n
    State: ${formData.state}\n
    City: ${formData.address}\n
    Time: ${formData.time}\n
    Additional Info: ${formData.additionalInfo}\n
    `,
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);

    const missingFields = Object.entries(formData).filter(
      ([key, value]) => key !== "otherEvent" && !value.trim()
    );

    if (formData.natureOfEvent === "other" && !formData.otherEvent.trim()) {
      missingFields.push(["otherEvent", ""]);
    }

    // if (missingFields.length > 0) {
    //   toast.error("Please fill in all required fields.");
    //   alert("Please fill in all required fields");
    //   return;
    // }

    emailjs
      .send(SERVICE_ID!, TEMPLATE_ID!, templateParams, PRIVATE_KEY!)
      .then((response) => {
        console.log("Email sent!", response);
        toast.success("Booking submitted successfully!");
        setIsSuccessful(true);
      })
      .catch((err) => {
        console.error("Email failed to send:", err);
      })
      .finally(() => {
        setIsSubmitting(false);
      });

    console.log("Form Data:", formData);
  };

  return (
    <div className="bg-white p-6 max-w-4xl mx-auto text-black text-sm">
      {/* <Toaster /> */}
      {isSuccessful ? (
        <>
          <div className="flex flex-col gap-3 justify-center items-center p-3">
            <img src={checked.src} alt="" width={50} />
            <p className=" mb-4 text-center">
              We have received your booking information our team will reach out
              to you shortly
            </p>
            <button
              onClick={() => onPressBack?.()}
              className="text-sm flex gap-2 items-center rounded-lg text-white bg-primary  mb-5 py-2 px-3"
            >
              {/* <MdArrowLeft /> */}
              Go back
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between">
            {/* <MdClose onClick={() => onCancel()} /> */}
            <div>
              <button
                onClick={() => onPressBack?.()}
                className="text-sm flex gap-2 items-center rounded-lg text-primary  mb-5"
              >
                <MdArrowLeft />
                Back
              </button>
              <p className="text-xl font-bold mb-4">Event Form</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">First Name*</label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block mb-1">Last Name*</label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1">Name of Organisation*</label>
              <input
                type="text"
                name="organisation"
                required
                value={formData.organisation}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">Email*</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block mb-1">Phone Number*</label>
                <input
                  type="text"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1">Website</label>
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
            </div>

            <div>
              <label className="block mb-1">Social Media Page*</label>
              <input
                type="text"
                name="socialMedia"
                required
                value={formData.socialMedia}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
            </div>

            <div>
              <label className="block mb-1">Event Name or Theme*</label>
              <input
                type="text"
                name="eventName"
                required
                value={formData.eventName}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div>
                  <label className="block mb-1">Nature of Event*</label>
                  <select
                    name="natureOfEvent"
                    required
                    value={formData.natureOfEvent}
                    onChange={handleChange}
                    className="w-full border rounded p-2"
                  >
                    <option value="">Select</option>
                    <option value="Crusade">Crusade</option>
                    <option value="Church Program">Church Program</option>
                    <option value="Conference">Conference</option>
                    <option value="Music Concert">Music Concert</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {formData.natureOfEvent === "other" && (
                  <div>
                    <label className="block mb-1">Specify Event</label>
                    <input
                      type="text"
                      name="otherEvent"
                      value={formData.otherEvent}
                      onChange={handleChange}
                      className="w-full border rounded p-2"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block mb-1">Event Time*</label>
                <input
                  type="datetime-local"
                  name="time"
                  required
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-1">Event Country*</label>
                <input
                  type="text"
                  name="country"
                  required
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block mb-1">Event State*</label>
                <input
                  type="text"
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block mb-1">Event Address*</label>
                <input
                  required
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1">
                Additional Information about Event
              </label>
              <textarea
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleChange}
                className="w-full border rounded p-2"
                rows={4}
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-white py-2 px-4 rounded hover:bg-black"
            >
              {isSubmitting ? <Loader size="small" /> : "Submit"}
            </button>
          </form>
        </>
      )}{" "}
    </div>
  );
};

export default EventForm;
