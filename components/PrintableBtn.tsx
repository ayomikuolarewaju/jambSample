"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="btn-secondary flex items-center gap-2"
    >
      🖨️ Print Result Slip
    </button>
  );
}