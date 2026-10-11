"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import BookDemoModal from "../components/modals/BookDemoModal";
import ContactModal from "../components/modals/ContactModal";
import ProposalModal from "../components/modals/ProposalModal";

interface ModalContextType {
  openDemoModal: () => void;
  closeDemoModal: () => void;
  openContactModal: () => void;
  closeContactModal: () => void;
  openProposalModal: () => void;
  closeProposalModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);

  const openDemoModal = () => setIsDemoModalOpen(true);
  const closeDemoModal = () => setIsDemoModalOpen(false);
  const openContactModal = () => setIsContactModalOpen(true);
  const closeContactModal = () => setIsContactModalOpen(false);
  const openProposalModal = () => setIsProposalModalOpen(true);
  const closeProposalModal = () => setIsProposalModalOpen(false);

  return (
    <ModalContext.Provider value={{ 
      openDemoModal, closeDemoModal, 
      openContactModal, closeContactModal,
      openProposalModal, closeProposalModal
    }}>
      {children}
      <BookDemoModal isOpen={isDemoModalOpen} onClose={closeDemoModal} />
      <ContactModal isOpen={isContactModalOpen} onClose={closeContactModal} />
      <ProposalModal isOpen={isProposalModalOpen} onClose={closeProposalModal} />
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
