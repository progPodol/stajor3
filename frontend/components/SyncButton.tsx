import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { FaSync } from 'react-icons/fa';
import styles from '../styles/SyncButton.module.css';

interface SyncButtonProps {
  onSync: () => Promise<void>;
  disabled?: boolean;
  className?: string;
}

export const SyncButton: React.FC<SyncButtonProps> = ({ 
  onSync, 
  disabled = false, 
  className = '' 
}) => {
  const { t } = useTranslation('common');
  const [isSyncing, setIsSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSync = async () => {
    if (isSyncing || disabled) return;
    
    setIsSyncing(true);
    setMessage(null);
    
    try {
      await onSync();
      setMessage(t('homepage.syncSuccess'));
      
      // Скрыть сообщение об успехе через 3 секунды
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Sync error:', error);
      setMessage(t('homepage.syncError'));
      
      // Скрыть сообщение об ошибке через 5 секунд
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className={`${styles.syncContainer} ${className}`}>
      <button
        className={`${styles.syncButton} ${isSyncing ? styles.syncing : ''}`}
        onClick={handleSync}
        disabled={disabled || isSyncing}
        aria-label={isSyncing ? t('homepage.syncing') : t('homepage.syncData')}
      >
        <FaSync className={`${styles.syncIcon} ${isSyncing ? styles.spinning : ''}`} />
        <span className={styles.syncText}>
          {isSyncing ? t('homepage.syncing') : t('homepage.syncData')}
        </span>
      </button>
      
      {message && (
        <div className={`${styles.message} ${message.includes('error') ? styles.error : styles.success}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default SyncButton;