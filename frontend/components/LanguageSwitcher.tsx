import { useRouter } from 'next/router';
import styles from '../styles/Header.module.css';

export const LanguageSwitcher = () => {
  const router = useRouter();

  const toggleLanguage = () => {
    const nextLocale = router.locale === 'ru' ? 'en' : 'ru';
    const { pathname, asPath, query } = router;
    router.push({ pathname, query }, asPath, { locale: nextLocale });
  };

  return (
    <button
      onClick={toggleLanguage}
      className={styles.langBtn}
      aria-label="Switch language"
    >
      {router.locale?.toUpperCase() || 'EN'}
    </button>
  );
};
