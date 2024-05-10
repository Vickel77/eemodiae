import React, { useState } from "react";

// interface

export default function AddComment() {
  const [values, setValues] = useState();

  const handleChange = (e: any) => {
    e.target.value;
  };

  return (
    <div>
      <form action="">
        <input className="w-full" type="text" />
        <textarea />
        <button className="btn">Submit</button>
      </form>
    </div>
  );
}
