import React, { ReactNode, useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { Girl, Service } from "../../types/girls";
import styles from "../../styles/Home.module.css";
import ModelGrid from "../ModelGrid";
import { Header } from "../Header";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import ScrollToTop from '../../components/ScrollToTop';

interface ContactInfo {
  whatsapp?: string;
  telegram?: string;
  site_name?: string;
  url?: string;
  image?: string;
  type?: string;
}

interface MainLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  models?: Girl[];
  services?: Service[];
  seoText?: string;
  contact?: ContactInfo;
  hideFooter?: boolean;
  hideSidebarLeft?: boolean;
  hideHeaderText?: boolean;
  canonicalUrl?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  title,
  description,
  children,
  models = [],
  services = [],
  seoText,
  contact,
  hideFooter = false,
  hideSidebarLeft = false,
  hideHeaderText = false,
  canonicalUrl,
}) => {
  const { t } = useTranslation("common");
  const router = useRouter();

  const [servicesOpen, setServicesOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
const locales = ["ru", "en"];
  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth <= 768);
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  return (
    <>
<Head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:site_name" content={contact?.site_name || "Site"} />
  <meta property="og:type" content={contact?.type || "website"} />
  <meta property="og:image" content={contact?.image || "/default-image.jpg"} />
  {(() => {
    const baseUrl = process.env.NEXT_PUBLIC_CANONICAL_BASE_URL || contact?.url || "";
    const fullUrl = baseUrl ? `${baseUrl}${router.asPath}` : router.asPath;
    return <meta property="og:url" content={fullUrl} />;
  })()}
  <link rel="icon" href="/static/favicon.ico" />


  {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
  <meta name="robots" content="index, follow" />
  {/* hreflang */}
  {locales.map((locale) => {
    const baseUrl = process.env.NEXT_PUBLIC_CANONICAL_BASE_URL || "";
    const path = router.asPath.split("?")[0];
    const href =
      locale === "ru"
        ? `${baseUrl}${path}`
        : `${baseUrl}/${locale}${path}`;

    return (
      <link
        key={locale}
        rel="alternate"
        hrefLang={locale}
        href={href}
      />
    );
  })}

  <link
    rel="alternate"
    hrefLang="x-default"
    href={`${process.env.NEXT_PUBLIC_CANONICAL_BASE_URL}${router.asPath.split("?")[0]}`}
  />
</Head>
      <Header contact={contact || null} />

      <div className={styles.layout}>
        {!hideHeaderText && (
          <header className={styles.topText}>
            <div className={styles.headerContent}>
              <h1 className={styles.title}>{title}</h1>
              <h2 className={styles.description}>{description}</h2>
            </div>
          </header>
        )}

        <div className={styles.contentWrapper}>
          {!hideSidebarLeft && (
            <aside className={styles.sidebarLeft}>
              {!isMobile && <h2>{t("layout.escortServices")}</h2>}

              {isMobile && (
                <button
                  className={styles.servicesToggleBtn}
                  onClick={() => setServicesOpen(!servicesOpen)}
                  aria-expanded={servicesOpen}
                  aria-controls="services-list"
                >
                  {t("layout.escortServices")} {servicesOpen ? "▲" : "▼"}
                </button>
              )}

                    <ul
                      id="services-list"
                      className={`${styles.servicesList} ${
                        servicesOpen || !isMobile ? styles.open : ""
                      }`}
                    >
                      {services.map((service) => (
                        <li key={service.slug}>
                          <h3>
                            <Link
                              href={`/services/${service.slug}`}
                              onClick={() => isMobile && setServicesOpen(false)} // закрываем меню на мобильном
                            >
                              {router.locale === "en"
                                ? service.name_en || service.name
                                : service.name}
                            </Link>
                          </h3>
                        </li>
                      ))}
                    </ul>

            </aside>
          )}

          <main className={styles.modelsContainer}>
            {seoText && <div className={styles.seoText}>{seoText}</div>}

            {models.length > 0 ? (
              <>
                <ModelGrid models={models} />
                {children}
              </>
            ) : (
              children || <p></p>
            )}
          </main>
        </div>

        {!hideFooter && (
          <footer className={styles.footer}>
            <div className={styles.footerContent}>
              <div className={styles.footerSections}>
                <div className={styles.footerColumn}>
                  <h2>{t("layout.footer.navigation")}</h2>
                  <ul>
                    <li key="nav-home">
                      <Link href="/">{t("layout.footer.home")}</Link>
                    </li>
                    <li key="nav-about">
                      <Link href="/about">{t("layout.footer.about")}</Link>
                    </li>
                    <li key="nav-services">
                      <Link href="/rabota">{t("layout.footer.rabota")}</Link>
                    </li>
                    <li key="nav-contacts">
                      <Link href="/contacts">{t("layout.footer.contacts")}</Link>
                    </li>
                  </ul>
                </div>

                <div className={styles.footerColumn}>
                  <h3>{t("layout.footer.contactsTitle")}</h3>
                  {contact?.telegram && (
                    <p>
                      {t("layout.footer.telegram")}:{" "}
                      <a
                        href={`https://t.me/${contact.telegram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        {contact.telegram}
                      </a>
                    </p>
                  )}
                  {contact?.whatsapp && (
                    <p>
                      {t("layout.footer.whatsapp")}:{" "}
                      <a
                        href={`https://wa.me/${contact.whatsapp.replace(
                          /[^\d]/g,
                          ""
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        {t("layout.footer.writeMessage")}
                      </a>
                    </p>
                  )}
                </div>

                <div className={styles.footerColumn}>
                  <h3>{t("layout.footer.socialMedia")}</h3>
                  <ul>
                    <li key="social-telegram">
                      <a
                        href={
                          contact?.telegram
                            ? `https://t.me/${contact.telegram}`
                            : "#"
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Telegram
                      </a>
                    </li>
                    <li key="social-whatsapp">
                      <a
                        href={
                          contact?.whatsapp
                            ? `https://wa.me/${contact.whatsapp.replace(
                                /[^\d]/g,
                                ""
                              )}`
                            : "#"
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        WhatsApp
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              <div className={styles.footerBottom}>
                {t("layout.footer.copyright", { year: new Date().getFullYear() })}
              </div>
            </div>
          </footer>
        )}

    <ScrollToTop />
      </div>
    </>
  );
};

export default MainLayout;
