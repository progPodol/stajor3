import React from "react";
import Link from "next/link";
import { Girl } from "../types/girls";
import styles from "../styles/Home.module.css";
import { Card, CardContent } from "./ui/card";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

interface ModelGridProps {
  models?: Girl[];
}

const ModelGrid: React.FC<ModelGridProps> = ({ models = [] }) => {
  const { t } = useTranslation("common");
  const router = useRouter();

  return (
    <div className={styles.grid}>
      {models.map((model) => (
        <div key={model.slug} style={{ position: "relative" }}>
          <Link href={`/girl/${model.slug}`} className={styles.cardLink}>
            <Card className={`${styles.card} ${styles.hoverCard}`}>
              <CardContent className={styles.cardContent}>
                <div className={styles.imageWrapper}>
                  <img
                    src={model.photos?.[0]?.photo_url || "/static/no-photo.jpg"}
                    alt={`Фото модели ${model.name}`}
                    className={styles.image}
                    loading="lazy"
                  />

                  {model.verified && (
                    <div className={styles.verifiedBadge}>✔ Verified</div>
                  )}

                  <div className={styles.badgeContainer}>
                    {model.elit && <span className={`${styles.badge} ${styles.elit}`}>Elite</span>}
                    {model.indi && <span className={`${styles.badge} ${styles.indi}`}>Indi</span>}
                    {model.new && <span className={`${styles.badge} ${styles.new}`}>New</span>}
                  </div>

                  <div className={styles.overlay}>
                    {router.locale === "en"
                      ? model.name_en || model.name
                      : model.name}
                    <p>
                      {t("modelGrid.price_per_hour")} {model.price_per_hour}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default ModelGrid;