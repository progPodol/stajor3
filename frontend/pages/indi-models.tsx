import React, { useState } from "react";
import type { NextPage, GetServerSideProps } from "next";
import { Girl, Service } from "../types/girls";
import MainLayout from "../components/layouts/MainLayout";
import styles from "../styles/Home.module.css";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
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

interface IndiModelsProps {
  initialGirls: Girl[];
  services: Service[];
  contact: ContactData | null;
}

const LIMIT = 9;

const IndiModels: NextPage<IndiModelsProps> = ({ initialGirls, services, contact }) => {
  const { t } = useTranslation("common");
  const router = useRouter();

  const initializeGirls = (girls: Girl[]) =>
    girls.map((girl) => ({
      ...girl,
      description:
        girl.description ||
        t("home.modelDescription", {
          place: girl.city || t("home.modelDescriptionDefaults.place"),
          boobs: girl.boobs || t("home.modelDescriptionDefaults.boobs"),
          price: girl.price_per_hour || t("home.modelDescriptionDefaults.price"),
        }),
    }));

  const [girls, setGirls] = useState<Girl[]>(() => initializeGirls(initialGirls));
  const [offset, setOffset] = useState(initialGirls.length);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await fetch(
        apiUrl(`/girls/get-by-role/indi?offset=${offset}&limit=${LIMIT}`, false)
      );
      if (!res.ok) {
        setHasMore(false);
        setLoading(false);
        return;
      }
      const newGirls: Girl[] = await res.json();

      const processedGirls = initializeGirls(newGirls);

      if (processedGirls.length < LIMIT) setHasMore(false);

      setGirls((prev) => [...prev, ...processedGirls]);
      setOffset((prev) => prev + processedGirls.length);
    } catch (e) {
      console.error("Ошибка загрузки инди моделей:", e);
      setHasMore(false);
    }
    setLoading(false);
  };

  const title = t("indiModels.title");
  const description = t("indiModels.description");

  return (
    <MainLayout title={title} description={description} models={girls} services={services} contact={contact}>
      <div style={{ textAlign: "center", marginTop: 20 }}>
        {hasMore ? (
          <button onClick={loadMore} disabled={loading} className={styles.loadMoreButton}>
            {loading ? t("homepage.loading") : t("homepage.loadMore", { count: LIMIT })}
          </button>
        ) : (
          <p>{t("homepage.noMoreModels")}</p>
        )}
      </div>
    </MainLayout>
  );
};

export const getServerSideProps: GetServerSideProps<IndiModelsProps> = async ({ locale }) => {
  try {
    const [girlsRes, servicesRes, contactRes] = await Promise.all([
      fetch(apiUrl(`/girls/get-by-role/indi?offset=0&limit=${LIMIT}`, true)),
      fetch(apiUrl(`/services/all`, true)),
      fetch(apiUrl(`/sites/all`, true)),
    ]);

    const initialGirls: Girl[] = girlsRes.ok ? await girlsRes.json() : [];
    const services: Service[] = servicesRes.ok ? await servicesRes.json() : [];
    const contactData = contactRes.ok ? await contactRes.json() : null;

    return {
      props: {
        initialGirls,
        services,
        contact: contactData?.[0] || null,
        ...(await serverSideTranslations(locale ?? "ru", ["common"])),
      },
    };
  } catch (error) {
    console.error("Ошибка при получении данных:", error);
    return {
      props: {
        initialGirls: [],
        services: [],
        contact: null,
        ...(await serverSideTranslations(locale ?? "ru", ["common"])),
      },
    };
  }
};

export default IndiModels;
