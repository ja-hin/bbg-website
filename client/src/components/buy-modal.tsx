import { useEffect } from "react";
import { X } from "lucide-react";
import { DevicePlanSelectorForm } from "./device-plan-selector-form";

interface BuyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BuyModal({ isOpen, onClose }: BuyModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      data-testid="modal-buy-plans"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        data-testid="modal-overlay"
      />
      <div className="relative z-10 w-full max-w-md mx-4">
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-20 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
          data-testid="button-close-modal"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
        <DevicePlanSelectorForm onSubmitSuccess={onClose} />
      </div>
    </div>
  );
}
