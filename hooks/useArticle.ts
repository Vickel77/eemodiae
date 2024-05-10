import React, { useState } from "react";
import { toast } from "react-toastify";
import useApi from "./useApi";

export default function useArticle() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>();

  const  {apiRequest} = useApi("article");

  const createArticle = async (values: PoemForm) => {
    setIsSubmitting(true);
    try {
      const response = await apiRequest({
        body: JSON.stringify(values),
        method: "POST",
      });
      console.log("create Article response ", response);

      toast("Article Created Successful");
    } catch (error) {
      toast("Article not Created Successful");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateArticle = async (values: PoemForm, id: string) => {
    setIsSubmitting(true);
    try {
      const response = await apiRequest({
        body: JSON.stringify(values),
        method: "PUT",
        params: id,
      });
      console.log("update Article response ", response);

      toast("Article updated Successful");
    } catch (error) {
      toast("Article not updated Successful");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deletePArticle = async (id: string) => {
    setIsSubmitting(true);
    try {
      const response = await apiRequest({ method: "DELETE", params: id });
      console.log(" delete Article response ", response);

      toast("Article Deleted Successful");
    } catch (error) {
      toast("Article not Deleted Successful");
    } finally {
      setIsSubmitting(false);
    }
  };

  return { createArticle, updateArticle, deletePArticle, isSubmitting };
}
