import React, { useContext, useState } from "react";
import Navbar from "../../components/Navbar";
import AuthContext from "../../context/AuthContext";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

export default function Admin() {
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);
  const router = useRouter();

  const [values, setValues] = useState<{ name: string; password: string }>({
    name: "",
    password: "",
  });

  const handleSubmit = () => {
    if (values.password === "") {
      return alert("Wrong Credentials ");
    }

    if (
      values.name.toLocaleLowerCase() === "eemodiae" &&
      values.password === "admin911"
    ) {
      setIsLoggedIn(true);
      router.push("/");
      toast("Login Successful ");
    } else toast("Wrong Credentials ");
  };

  return (
    <div className="mt-[10rem] m-auto max-w-xl">
      <Navbar />
      <div>
        <div className="sm:col-span-4 mb-5">
          <label
            htmlFor="email"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Name
          </label>
          <div className="mt-2">
            <input
              id="title"
              name="title"
              type="title"
              onChange={(e) =>
                setValues((prev) => ({ ...prev, name: e.target.value }))
              }
              // autoComplete="email"
              className="bg-white block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
            />
          </div>
        </div>
        <div className="sm:col-span-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Password
          </label>
          <div className="mt-2">
            <input
              id="title"
              name="title"
              type="password"
              onChange={(e) =>
                setValues((prev) => ({ ...prev, password: e.target.value }))
              }
              // autoComplete="email"
              className="bg-white block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
            />
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-3 sm:flex justify-center gap-5 sm:px-6">
          <button
            onClick={handleSubmit}
            type="button"
            className="inline-flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
