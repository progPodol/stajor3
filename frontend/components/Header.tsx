import Link from "next/link";
import styles from "../styles/Header.module.css";
import { FaTelegramPlane, FaWhatsapp } from "react-icons/fa";
import { useTranslation } from "next-i18next";
import React, { useState } from "react";
import { LanguageSwitcher } from './LanguageSwitcher';
import { FaBars, FaTimes } from 'react-icons/fa';
import Image from "next/image";

type Contact = {
  whatsapp?: string;
  telegram?: string;
  site_name?: string | null;
    url?: string;
  image?: string;
  type?: string;
} | null;

interface HeaderProps {
  contact: Contact;
}

export function Header({ contact }: HeaderProps) {
  const { t } = useTranslation("common");
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  const telegramLink = contact?.telegram
    ? `https://t.me/${contact.telegram}`
    : "#";

  const whatsappLink = contact?.whatsapp
    ? `https://wa.me/${contact.whatsapp.replace(/[^\d]/g, "")}`
    : "#";

  const siteName = contact?.site_name || "Default Site";

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Link href="/" className={styles.logo} onClick={closeMenu}>
          {siteName}
        </Link>
      </div>
      <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ""}`}>
        <div className={styles.navGroup}>
          <Link href="/" className={styles.link} onClick={closeMenu}>
            {t("header.navigation.allModels")}
          </Link>
          <Link href="/elit-models" className={styles.link} onClick={closeMenu}>
            {t("header.navigation.eliteModels")}
          </Link>
          <Link href="/new-models" className={styles.link} onClick={closeMenu}>
            {t("header.navigation.newModels")}
          </Link>
          <Link href="/indi-models" className={styles.link} onClick={closeMenu}>
            {t("header.navigation.indiModels")}
          </Link>
        </div>
        <div className={styles.navGroup}>
          <Link href="/rabota" className={styles.link} onClick={closeMenu}>
            {t("header.navigation.escortWork")}
          </Link>
          <Link href="/contacts" className={styles.link} onClick={closeMenu}>
            {t("header.navigation.contacts")}
          </Link>
          <Link href="/about" className={styles.link} onClick={closeMenu}>
            {t("header.navigation.about")}
          </Link>
        </div>
      </nav>

      {/* Правый блок с иконками и языковым переключателем */}
      <div className={styles.right}>
        {/* Кнопка бургер для мобильных */}
<button
  className={styles.burger}
  onClick={toggleMenu}
  aria-label={menuOpen ? t("header.closeMenu") : t("header.openMenu")}
  aria-expanded={menuOpen}
  type="button"
>
  {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
</button>

        <a href={telegramLink} target="_blank" rel="noopener noreferrer" aria-label="Telegram">
          <FaTelegramPlane className={styles.icon} />
        </a>
        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
          <FaWhatsapp className={styles.icon} />
        </a>
        {/* Языковой переключатель */}
        <LanguageSwitcher />
      </div>
    </header>
  );
}
