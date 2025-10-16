import { Girl } from "../types/girls";
import type { TFunction } from "next-i18next";

export function getGirlDescription(girl: Girl, t: TFunction): string {
  return girl.description || t('home.modelDescription', {
    place: girl.city || t('home.modelDescriptionDefaults.place'),
    boobs: girl.boobs || t('home.modelDescriptionDefaults.boobs'),
    price: girl.price_per_hour || t('home.modelDescriptionDefaults.price'),
  });
}
