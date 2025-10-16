import React from "react";

export function Label({ children }: { children: React.ReactNode }) {
  return <label className="block mb-1 font-semibold">{children}</label>;
}
