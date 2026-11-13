import { useContext } from 'react';
import { LocaleContext } from '@/i18n/LocaleProvider';

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocale harus dipakai di dalam LocaleProvider');
  return context;
}
