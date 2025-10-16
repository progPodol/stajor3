export interface ModelPhoto {
  id: number;
  model_uuid: string;
  photo_url: string;
}

export interface Service {
  id: number;
  name: string;
  name_en: string;
  slug: string;
  models?: Girl[];
}

export interface Girl {
  uuid: string;
  likes?: number;
  name: string;
  name_en: string;
  description: string;
  description_en: string;
  city: string;
  city_en: string;
  age: number;
  price_per_hour: number;
  price_per_4: number;
  price_per_night: number;
  elit?: boolean;
  new?: boolean;
  indi?: boolean;
  height?: number;
  weight?: number;
  boobs?: number;
  slug: string;
  verified: boolean;
  photos: ModelPhoto[];
  services: Service[];
}

export interface Site {
  id: number;
  site_name: string;
  whatsapp: string;
  telegram: string;
  url: string;
  image: string;
  type: string;
}
