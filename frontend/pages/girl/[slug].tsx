import { NextPage, GetServerSideProps } from "next";
import React, { useState, useCallback } from "react";
import { Girl, Service } from "../../types/girls";
import MainLayout from "../../components/layouts/MainLayout";
import Image from "next/image";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import styles from "../../styles/GirlProfile.module.css";
import Link from "next/link";
import { useSwipeable } from "react-swipeable";
import { useRouter } from "next/router";
import { apiUrl } from "../../utils/api";

interface GirlPageProps {
  girl: Girl | null;
  services: Service[];
  contact: any;
  randomGirls: Girl[];
}

function getAgeText(age: number, lang: string): string {
  if (lang === "en") return `${age} y.o.`;

  const lastDigit = age % 10;
  const lastTwoDigits = age % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return `${age} лет`;
  if (lastDigit === 1) return `${age} год`;
  if (lastDigit >= 2 && lastDigit <= 4) return `${age} года`;
  return `${age} лет`;
}

function generateH1(model: Girl, lang: string): string {
  const name = lang === "en" ? model.name_en || model.name : model.name;
  const age = model.age ? getAgeText(model.age, lang) : "";
  const boobs = model.boobs ? (lang === "ru" ? `${model.boobs} размер груди` : `${model.boobs} breast size`) : "";
  const city = lang === "en" ? model.city_en || model.city : model.city;

  const cityCasesRu: Record<string, string> = {
    "Москва": "в Москве",
    "Дубай": "в Дубае",
    "Санкт-Петербург": "в Санкт-Петербурге",
    "Казань": "в Казани",
    "Новосибирск": "в Новосибирске",
    "Екатеринбург": "в Екатеринбурге",
    "Сочи": "в Сочи",
    "Краснодар": "в Краснодаре",
    "Уфа": "в Уфе",
    "Омск": "в Омске",
  };
  const cityInCase = lang === "ru" ? cityCasesRu[city] || `в ${city}` : `in ${city}`;

  const parts = [];
  if (name) parts.push(name);
  if (age) parts.push(age);
  if (boobs) parts.push(boobs);

  return `${parts.join(", ")} — ${lang === "en" ? "escort model" : "эскорт модель"} ${cityInCase}`;
}

const GirlPage: NextPage<GirlPageProps> = ({ girl, services, contact, randomGirls }) => {
  const { t, i18n } = useTranslation("common");
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [fade, setFade] = useState(false);
  const router = useRouter();

  const changePhoto = useCallback(
    (newIndex: number) => {
      setFade(true);
      setTimeout(() => {
        setCurrentPhotoIndex(newIndex);
        setFade(false);
      }, 300);
    },
    []
  );
const handleNextPhoto = useCallback(() => {
  if (!girl?.photos?.length) return;
  setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % girl.photos.length);
}, [girl?.photos?.length]);

const handlePrevPhoto = useCallback(() => {
  if (!girl?.photos?.length) return;
  setCurrentPhotoIndex((prevIndex) => (prevIndex - 1 + girl.photos.length) % girl.photos.length);
}, [girl?.photos?.length]);

  const handlers = useSwipeable({
    onSwipedLeft: handleNextPhoto,
    onSwipedRight: handlePrevPhoto,
    trackMouse: true,
  });

  if (!girl) {
    return <p>{t("modelPage.notFound")}</p>;
  }

  const lang = i18n.language;
  const localizedName = lang === "en" ? girl.name_en || girl.name : girl.name;
  const localizedCity = lang === "en" ? girl.city_en || girl.city : girl.city;
  const localizedDescription = lang === "en" ? girl.description_en || girl.description : girl.description;

  return (
    <MainLayout
      title={generateH1(girl, lang)}
      description={localizedDescription}
      services={services}
      contact={contact}
      hideHeaderText
      hideSidebarLeft
    >
      <div className={styles.contentWrapper}>

        <h1 className={styles.title}>{generateH1(girl, lang)}</h1>

        <div className={styles.columns}>

          <div className={styles.leftColumn}>
                        <button
          className={styles.backButton}
          onClick={() => router.back()}
          aria-label={t("modelPage.back")}
          type="button"
        >
          	‹ {t("modelPage.back")}
        </button>
            <div className={styles.mainPhoto} {...handlers}>

                    <Image
                      src={girl.photos?.[currentPhotoIndex]?.photo_url || "/static/no-photo.jpg"}
                      alt={localizedName}
                      width={300}
                      height={400}
                      className={`${styles.image} ${fade ? styles.fadeOut : ""}`}
                    />
                  {girl.verified && (
                    <div className={styles.verifiedBadge}>
                      ✔ Verified
                    </div>
                  )}
            </div>

<div className={styles.thumbnails}>
  {girl.photos && girl.photos.length > 0 ? (
    girl.photos.map((photo, index) => (
      <div
        key={`${photo.id ?? 'photo'}-${index}`}
        onClick={() => setCurrentPhotoIndex(index)}
        className={`${styles.thumbnail} ${index === currentPhotoIndex ? styles.activeThumbnail : ""}`}
      >
        <Image
          src={photo.photo_url || "/static/no-photo.jpg"}
          alt={`Thumbnail ${index + 1}`}
          width={60}
          height={80}
        />
      </div>
    ))
  ) : (
    <div className={styles.noPhotos}>
      <Image
        src="/static/no-photo.jpg"
        alt="No photos available"
        width={60}
        height={80}
      />
    </div>
  )}
</div>


            <div className={styles.contacts}>
              {contact?.telegram && (
                <a href={`https://t.me/${contact.telegram.replace("@", "")}`} target="_blank" rel="noopener noreferrer">
                  Telegram
                </a>
              )}
              {contact?.whatsapp && (
                <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
              )}
            </div>
          </div>

          <div className={styles.middleColumn}>

            <div className={styles.details}>
              <h2>{t("modelPage.description")}</h2>

<ul className={styles.detailList}>
  <li><strong>{t("modelPage.city")}:</strong> {localizedCity}</li>
  <li><strong>{t("modelPage.age")}:</strong> {girl.age}</li>
  {girl.height && <li><strong>{t("modelPage.height")}:</strong> {girl.height} cm</li>}
  {girl.weight && <li><strong>{t("modelPage.weight")}:</strong> {girl.weight} kg</li>}
  {girl.boobs && <li><strong>{t("modelPage.boobs")}:</strong> {girl.boobs}</li>}
  <li><strong>{t("modelPage.pricePerHour")}:</strong> <span className={styles.price}>{girl.price_per_hour} AED</span></li>
  <li><strong>{t("modelPage.pricePer4Hours")}:</strong> <span className={styles.price}>{girl.price_per_4} AED</span></li>
  {girl.price_per_night && <li><strong>{t("modelPage.pricePerNight")}:</strong> <span className={styles.price}>{girl.price_per_night} AED</span></li>}
  <li><strong>{t("modelPage.description2")}:</strong> {localizedDescription}</li>
</ul>


{girl.services?.length > 0 && (
  <div className={styles.services}>
    <strong>{t("modelPage.services")}:</strong>
    <div className={styles.serviceList}>
      {girl.services.map((s) => (
        <span key={s.name} className={styles.serviceTag}>
          {i18n.language === "en" ? s.name_en || s.name : s.name}
        </span>
      ))}
    </div>
  </div>
)}
            </div>
          </div>

          <div className={styles.rightColumn}>

            <h2>{t("modelPage.otherModels")}</h2>

            <ul className={styles.randomGirls}>
              {randomGirls.map((g) => {
                const name = lang === "en" ? g.name_en || g.name : g.name;
                return (

                  <li key={g.slug}>
                    <Link href={`/girl/${g.slug}`} locale={i18n.language} className={styles.randomGirlCard}>
                      <Image
                        src={g.photos?.[0]?.photo_url || "/static/no-photo.jpg"}
                        alt={name}
                        width={50}
                        height={50}
                        className={`${styles.image} ${fade ? styles.fadeOut : ""}`}
                      />
                      <h3>{name}</h3>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params, locale }) => {
  const slug = params?.slug as string;

  try {
    const [girlRes, servicesRes, contactRes, allGirlsRes] = await Promise.all([
      fetch(apiUrl(`/girls/${slug}`, true)),
      fetch(apiUrl(`/services/all`, true)),
      fetch(apiUrl(`/sites/all`, true)),
      fetch(apiUrl(`/girls/all`, true)),
    ]);

    if (!girlRes.ok) {
      // Если запрос к девушке вернул ошибку — 404
      return { notFound: true };
    }

    const girl: Girl | null = await girlRes.json();

    if (!girl) {
      // Если девушка не найдена — 404
      return { notFound: true };
    }

    const services: Service[] = servicesRes.ok ? await servicesRes.json() : [];
    const contactData = contactRes.ok ? await contactRes.json() : null;
    const allGirls: Girl[] = allGirlsRes.ok ? await allGirlsRes.json() : [];

    const randomGirls = allGirls
      .filter((g) => g.slug !== slug)
      .sort(() => 0.5 - Math.random())
      .slice(0, 5);

    return {
      props: {
        girl,
        services,
        contact: contactData?.[0] || null,
        randomGirls,
        ...(await serverSideTranslations(locale ?? "ru", ["common"])),
      },
    };
  } catch (error) {
    console.error("Error loading girl page", error);
    return { notFound: true };
  }
};


export default GirlPage;
