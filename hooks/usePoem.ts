import React, { useState } from "react";
import { toast } from "react-toastify";
import useApi from "./useApi";

export default function usePoem() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>();

  const { apiRequest } = useApi("poem");

  const createPoem = async (values: PoemForm) => {
    setIsSubmitting(true);
    try {
      const response = await apiRequest({
        body: JSON.stringify(values),
        method: "POST",
      });

      toast("Post Created Successful");
    } catch (error) {
      toast("Post not Created Successful");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updatePoem = async (values: PoemForm, id: string) => {
    setIsSubmitting(true);
    try {
      const response = await apiRequest({
        body: JSON.stringify(values),
        method: "PUT",
        params: id,
      });

      toast("Post updated Successful");
    } catch (error) {
      toast("Post not updated Successful");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deletePoem = async (id: string) => {
    setIsSubmitting(true);
    try {
      const response = await apiRequest({ method: "DELETE", params: id });

      toast("Poem Deleted Successful");
    } catch (error) {
      toast("Poem not Deleted Successful");
    } finally {
      setIsSubmitting(false);
    }
  };

  return { createPoem, updatePoem, deletePoem, isSubmitting };
}
