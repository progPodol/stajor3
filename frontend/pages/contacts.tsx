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

interface ContactProps {
  services: Service[];
  contact: ContactData | null;
}

const Contact: NextPage<ContactProps> = ({ services, contact }) => {
  const { t } = useTranslation("common");

  return (
    <MainLayout
      title={t("contact.title")}
      description={t("contact.description")}
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
        {/* Связаться */}
        <Section title={t("contact.getInTouch")}>
          <p>{t("contact.getInTouchText")}</p>
          <div
            style={{
              display: "flex",
              gap: "20px",
              flexWrap: "wrap",
              justifyContent: "center",
              marginTop: "20px",
            }}
          >
            {contact?.global_telegram && (
              <Button
                href={`https://t.me/${contact.global_telegram}`}
                color="#e91e63"
                text="Telegram"
              />
            )}
            {contact?.global_whatsapp && (
              <Button
                href={`https://wa.me/${contact.global_whatsapp.replace(/[^\d]/g, "")}`}
                color="#8b5cf6"
                text="WhatsApp"
              />
            )}
            {contact?.global_number && (
              <Button
                href={`tel:${contact.global_number}`}
                color="#10b981"
                text={t("layout.footer.phone")}
              />
            )}
          </div>
        </Section>

        {/* Рабочие часы */}
        <Section title={t("contact.workingHours")}>
          <p>
            <strong>{t("contact.available")}:</strong> {t("contact.availableTime")}
          </p>
          <p>
            <strong>{t("contact.responseTime")}:</strong> {t("contact.responseTimeText")}
          </p>
        </Section>

        {/* Конфиденциальность */}
        <Section title={t("contact.privacy")}>
          <p>{t("contact.privacyText")}</p>
          <ul style={{ paddingLeft: "20px", marginTop: "10px" }}>
            {[1, 2, 3].map((i) => (
              <li key={i} style={{ marginBottom: "8px" }}>
                {t(`contact.privacyPoint${i}`)}
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

interface ButtonProps {
  href: string;
  color: string;
  text: string;
}

const Button: React.FC<ButtonProps> = ({ href, color, text }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    style={{
      display: "inline-block",
      padding: "12px 24px",
      background: color,
      color: "white",
      textDecoration: "none",
      borderRadius: "12px",
      fontWeight: "600",
      transition: "all 0.3s ease",
    }}
  >
    {text}
  </a>
);

// --- Серверная часть ---

export const getServerSideProps: GetServerSideProps<ContactProps> = async ({ locale }) => {
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

export default Contact;
