import React from "react";
import styles from "./Card.module.css";

type StickerType = "Элит" | "New" | "Indie";

type CardProps = {
  children: React.ReactNode;
  className?: string;
  sticker?: StickerType;
};

export function Card({ children, className, sticker }: CardProps) {
  return (
    <div className={`${styles.card} ${className || ""}`} style={{ position: "relative" }}>
      {sticker && (
        <div className={`${styles.sticker} ${styles[`sticker--${sticker.toLowerCase()}`]}`}>
          {sticker}
        </div>
      )}
      {children}
    </div>
  );
}
