// pages/404.tsx
import React from "react";
import Link from 'next/link';
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

const Custom404: React.FC = () => {
  const { t } = useTranslation("common");

  return (
    <div style={{ textAlign: "center", padding: "100px 20px" }}>
      <h1 style={{ fontSize: "4rem", marginBottom: "1rem" }}>404</h1>
      <h2>{t("404.title", "Page Not Found")}</h2>
      <p style={{ margin: "20px 0" }}>
        {t(
          "404.description",
          "Sorry, the page you are looking for does not exist."
        )}
      </p>
      <Link href="/">
          {t("404.backToHome", "Go back home")}
      </Link>
    </div>
  );
};

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

export default Custom404;
