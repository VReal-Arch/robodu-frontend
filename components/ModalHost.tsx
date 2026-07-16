"use client";

import { useStore } from "@/store/store";
import { ModalAction } from "@/lib/types";

export default function ModalHost() {
  const modal = useStore((s) => s.modals[0]);
  const popModal = useStore((s) => s.popModal);

  if (!modal) return null;

  const actions: ModalAction[] =
    modal.actions && modal.actions.length ? modal.actions : [{ label: "OK", style: "primary" }];

  const cls: Record<string, string> = {
    primary: "btn-primary",
    outline: "btn-outline",
    danger: "btn-danger",
    ghost: "btn-ghost",
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-icon">{modal.icon ?? "ℹ️"}</div>
        <div className="modal-title">{modal.title}</div>
        {modal.body && <div className="modal-body" dangerouslySetInnerHTML={{ __html: modal.body }} />}
        <div className="modal-actions">
          {actions.map((a, i) => (
            <button
              key={i}
              className={"btn " + (cls[a.style ?? "primary"] ?? "btn-primary")}
              onClick={() => {
                popModal();
                a.onClick?.();
              }}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
