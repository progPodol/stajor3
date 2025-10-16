import React from "react";
import type { NextPage, GetServerSideProps } from "next";
import { Service } from "../types/girls";
import MainLayout from "../components/layouts/MainLayout";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { apiUrl } from "../utils/api";

interface ContactData {
  global_number?: string;
  global_telegram?: string;
  global_whatsapp?: string;
  site_name?: string;
  url?: string;
  image?: string;
  type?: string;
}

interface AboutProps {
  services: Service[];
  contact: ContactData | null;
}

const About: NextPage<AboutProps> = ({ services, contact }) => {
  const { t } = useTranslation("common");

  return (
    <MainLayout
      title={t("about.title")}
      description={t("about.description")}
      services={services}
      contact={contact}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "20px",
          color: "white",
          lineHeight: "1.6",
        }}
      >
        {/* Кто мы */}
        <Section title={t("about.whoWeAre")}>
          <p>{t("about.whoWeAreText")}</p>
        </Section>

        {/* Наша миссия */}
        <Section title={t("about.ourMission")}>
          <p>{t("about.ourMissionText")}</p>
        </Section>

        {/* Почему выбирают нас */}
        <Section title={t("about.whyChooseUs")}>
          <ul style={{ paddingLeft: "20px" }}>
            {[1, 2, 3, 4].map((i) => (
              <li key={i} style={{ marginBottom: "10px" }}>
                {t(`about.reason${i}`)}
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </MainLayout>
  );
};

// --- Компоненты ---

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => (
  <div
    style={{
      background: "rgba(36, 36, 36, 0.8)",
      padding: "30px",
      borderRadius: "20px",
      marginBottom: "30px",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
    }}
  >
    <h2
      style={{
        color: "#e91e63",
        marginBottom: "20px",
        fontSize: "1.5rem",
        fontWeight: "600",
      }}
    >
      {title}
    </h2>
    {children}
  </div>
);

// --- Серверная часть ---

export const getServerSideProps: GetServerSideProps<AboutProps> = async ({ locale }) => {
  try {
    const [servicesRes, contactRes] = await Promise.all([
      fetch(apiUrl(`/services/all`, true)),
      fetch(apiUrl(`/sites/all`, true)),
    ]);

    const services: Service[] = servicesRes.ok ? await servicesRes.json() : [];
    const contactData = contactRes.ok ? await contactRes.json() : null;

    return {
      props: {
        services,
        contact: contactData?.[0] || null,
        ...(await serverSideTranslations(locale ?? "ru", ["common"])),
      },
    };
  } catch (error) {
    console.error("Ошибка при получении данных:", error);
    return {
      props: {
        services: [],
        contact: null,
        ...(await serverSideTranslations(locale ?? "ru", ["common"])),
      },
    };
  }
};

export default About;
