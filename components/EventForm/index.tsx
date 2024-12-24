import React, { useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { MdArrowLeft, MdClose } from "react-icons/md";
import bookingBg from "../../assets/booking-bg.jpg";
const EventForm = ({ onPressBack }: { onPressBack?: () => void }) => {
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
    city: "",
    time: "",
    additionalInfo: "",
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();

    const missingFields = Object.entries(formData).filter(
      ([key, value]) => key !== "otherEvent" && !value.trim()
    );

    if (formData.natureOfEvent === "other" && !formData.otherEvent.trim()) {
      missingFields.push(["otherEvent", ""]);
    }

    if (missingFields.length > 0) {
      toast.error("Please fill in all required fields.");
      return;
    }

    toast.success("Form submitted successfully!");
    console.log("Form Data:", formData);
  };

  return (
    <div className="bg-white p-6 max-w-4xl mx-auto text-black text-sm">
      <Toaster />
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
            <label className="block mb-1">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block mb-1">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>
        </div>

        <div>
          <label className="block mb-1">Name of Organisation</label>
          <input
            type="text"
            name="organisation"
            value={formData.organisation}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block mb-1">Phone Number</label>
            <input
              type="text"
              name="phone"
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
          <label className="block mb-1">Social Media Page</label>
          <input
            type="text"
            name="socialMedia"
            value={formData.socialMedia}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block mb-1">Event Name or Theme</label>
          <input
            type="text"
            name="eventName"
            value={formData.eventName}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block mb-1">Nature of Event</label>
          <select
            name="natureOfEvent"
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1">Event Country</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block mb-1">Event State</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block mb-1">Event City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>
        </div>

        <div>
          <label className="block mb-1">Event Time</label>
          <input
            type="date"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
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
          className="bg-primary text-white py-2 px-4 rounded hover:bg-black"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default EventForm;
