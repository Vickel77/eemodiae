import React from "react";
import EventForm from ".";
import Modal from "../Modals";

function EventFormModal({
  showModal,
  onCancel,
}: {
  showModal: boolean;
  onCancel: () => void;
}) {
  return (
    <Modal showModal={showModal} onCancel={onCancel}>
      {/* <EventForm onCancel={onCancel} /> */}
    </Modal>
  );
}

export default EventFormModal;
