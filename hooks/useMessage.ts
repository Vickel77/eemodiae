import React, { useState } from "react";
import { toast } from "react-toastify";
import useApi from "./useApi";

export default function useAMessage() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>();

  const { apiRequest } = useApi("message");

  const createMessage = async (values: PoemForm) => {
    setIsSubmitting(true);
    try {
      const response = await apiRequest({
        body: JSON.stringify(values),
        method: "POST",
      });

      toast("Message Created Successful");
    } catch (error) {
      toast("Message not Created Successful");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateMessage = async (values: PoemForm, id: string) => {
    setIsSubmitting(true);
    try {
      const response = await apiRequest({
        body: JSON.stringify(values),
        method: "PUT",
        params: id,
      });

      toast("Message updated Successful");
    } catch (error) {
      toast("Message not updated Successful");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deletePMessage = async (id: string) => {
    setIsSubmitting(true);
    try {
      const response = await apiRequest({ method: "DELETE", params: id });

      toast("Message Deleted Successful");
    } catch (error) {
      toast("Message not Deleted Successful");
    } finally {
      setIsSubmitting(false);
    }
  };

  return { createMessage, updateMessage, deletePMessage, isSubmitting };
}
