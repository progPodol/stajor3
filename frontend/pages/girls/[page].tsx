import React from "react";
import { GetServerSideProps, NextPage } from "next";
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

interface PageProps {
  girls: Girl[];
  services: Service[];
  contact: ContactData | null;
  page: number;
  hasMore: boolean;
}

const LIMIT = 9;

const GirlsPage: NextPage<PageProps> = ({ girls, services, contact, page, hasMore }) => {
  const { t } = useTranslation('common');

  girls.forEach((girl) => {
    if (!girl.description) {
      girl.description = t('home.modelDescription', {
        place: girl.city || t('home.modelDescriptionDefaults.place'),
        boobs: girl.boobs || t('home.modelDescriptionDefaults.boobs'),
        price: girl.price_per_hour || t('home.modelDescriptionDefaults.price'),
      });
    }
  });

  const title = t('pages.title', {page: page});
  const description = t('pages.description', {page: page});

  return (
    <MainLayout title={title} description={description} models={girls} services={services} contact={contact}>

      <div style={{ textAlign: "center", marginTop: 20 }}>
        {hasMore ? (
          <a href={`/girls/${page + 1}`} className={styles.loadMoreButton}>
            {t('homepage.loadMore', { count: LIMIT })}
          </a>
        ) : (
          <p>{t('homepage.noMoreModels')}</p>
        )}
      </div>
    </MainLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params, locale }) => {
  const page = parseInt(params?.page as string, 10);
  const offset = (page - 1) * LIMIT;

  try {
    const [girlsRes, servicesRes, contactRes] = await Promise.all([
      fetch(apiUrl(`/girls/all?offset=${offset}&limit=${LIMIT}`, true)),
      fetch(apiUrl(`/services/all`, true)),
      fetch(apiUrl(`/sites/all`, true)),
    ]);

    const girls: Girl[] = girlsRes.ok ? await girlsRes.json() : [];
    const services: Service[] = servicesRes.ok ? await servicesRes.json() : [];
    const contactData = contactRes.ok ? await contactRes.json() : null;

    return {
      props: {
        girls,
        services,
        contact: contactData?.[0] || null,
        page,
        hasMore: girls.length === LIMIT,
        ...(await serverSideTranslations(locale ?? 'ru', ['common'])),
      },
    };
  } catch (err) {
    console.error("Ошибка загрузки страницы:", err);
    return {
      notFound: true,
    };
  }
};

export default GirlsPage;