'use client';

import { useStore } from '@/store/useStore';
import LoadingScreen from '@/components/LoadingScreen';
import Desktop from '@/components/Desktop';

export default function Home() {
  const { isLoading, setLoading } = useStore();

  const handleLoadingComplete = () => {
    setLoading(false);
  };

  return (
    <>
      {isLoading && <LoadingScreen onComplete={handleLoadingComplete} />}
      {!isLoading && <Desktop />}
    </>
  );
}
