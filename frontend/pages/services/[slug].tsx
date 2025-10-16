import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import MainLayout from "../../components/layouts/MainLayout";
import ModelGrid from "../../components/ModelGrid";
import styles from "../../styles/Home.module.css";
import { Girl, Service } from "../../types/girls";
import { apiUrl } from "../../utils/api";

interface ContactData {
  global_number?: string;
  global_telegram?: string;
  global_whatsapp?: string;
  site_name?: string;
}

interface ServicePageProps {
  service: Service | null;
  initialGirls: Girl[];
  services: Service[];
  contact?: ContactData | null;
}

const LIMIT = 9;

const ServicePage: NextPage<ServicePageProps> = ({ service, initialGirls = [], services, contact }) => {
  const { t, i18n } = useTranslation("common");
  const router = useRouter();

  if (router.isFallback) {
    return <div>{t("loading")}</div>;
  }

  if (!service) {
    return (
      <MainLayout title={t("errorLoading")} description="" services={services} contact={contact}>
        <p>{t("errorLoading")}</p>
      </MainLayout>
    );
  }

  const [girls, setGirls] = useState<Girl[]>(initialGirls);
  const [offset, setOffset] = useState(initialGirls.length);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Reset list when navigating between different services to avoid stale state
  React.useEffect(() => {
    setGirls(initialGirls || []);
    setOffset((initialGirls || []).length);
    setHasMore((initialGirls || []).length >= LIMIT);
  }, [service?.slug, initialGirls]);

  const loadMore = async () => {
    if (loading || !hasMore || !service?.slug) return;
    setLoading(true);

    try {
      const res = await fetch(
        apiUrl(`/girls/by-services/${service.slug}?offset=${offset}&limit=${LIMIT}`, false)
      );

      if (!res.ok) {
        setHasMore(false);
        setLoading(false);
        return;
      }

      const newGirls: Girl[] = await res.json();

      if (newGirls.length < LIMIT) setHasMore(false);

      setGirls((prev) => [...prev, ...newGirls]);
      setOffset((prev) => prev + newGirls.length);
    } catch (e) {
      setHasMore(false);
    }

    setLoading(false);
  };

  const lang = i18n.language;
  const service_name = lang === "en" ? service.name_en || service.name : service.name;
  const title = t("escortService") + `: ${service_name}`;
  const description = t("modelsOfferingService", {
    serviceName: service_name,
    city: t("inMoscow"),
  });

  return (
    <MainLayout title={title} description={description} services={services} contact={contact}>
      <ModelGrid models={girls} />

      <div style={{ textAlign: "center", marginTop: 20 }}>
        {hasMore ? (
          <button onClick={loadMore} disabled={loading} className={styles.loadMoreButton}>
            {loading
              ? t("loading")
              : t("homepage.loadMore", { count: LIMIT, defaultValue: `Показать еще ${LIMIT} моделей` })}
          </button>
        ) : (
          <p>{t("homepage.noMoreModels", { defaultValue: "Больше моделей нет" })}</p>
        )}
      </div>
    </MainLayout>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps<ServicePageProps> = async ({ params, locale }) => {
  const slug = params?.slug as string | undefined;

  if (!slug) {
    return { notFound: true };
  }

  try {
    const servicesRes = await fetch(apiUrl(`/services/all`, true));
    const services: Service[] = servicesRes.ok ? await servicesRes.json() : [];

    const serviceRes = await fetch(apiUrl(`/services/${slug}`, true));
    if (!serviceRes.ok) {
      return { notFound: true };
    }
    const service: Service | null = serviceRes.ok ? await serviceRes.json() : null;

    if (!service) {
      return { notFound: true };
    }

    const girlsRes = await fetch(
      apiUrl(`/girls/by-services/${slug}?offset=0&limit=${LIMIT}`, true)
    );
    const initialGirls: Girl[] = girlsRes.ok ? await girlsRes.json() : [];

    const contactRes = await fetch(apiUrl(`/sites/all`, true));
    const contactData = contactRes.ok ? await contactRes.json() : null;

    return {
      props: {
        ...(await serverSideTranslations(locale ?? "ru", ["common"])),
        service,
        initialGirls,
        services,
        contact: Array.isArray(contactData) ? contactData[0] || null : null,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error("Ошибка загрузки данных для сервиса:", error);
    return {
      notFound: true,
    };
  }
};

export default ServicePage;
