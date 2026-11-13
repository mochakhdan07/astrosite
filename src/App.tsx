import { useState } from 'react';
import StarField from '@/components/StarField';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import NavigationData from '@/components/NavigationData';
import Quiz from '@/components/Quiz';
import CertificateGenerator from '@/components/CertificateGenerator';
import Footer from '@/components/Footer';
import SectionBoundary from '@/components/SectionBoundary';
import { SITES } from '@/lib/lunarData';

function App() {
  const [result, setResult] = useState<{ score: number; total: number } | null>(null);
  const [heroSite, setHeroSite] = useState<string | null>(null);
  const [dataSite, setDataSite] = useState(SITES[0].id);

  function openData(id: string) {
    setDataSite(id);
    document.getElementById('data')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <StarField />
      <div className="relative z-10">
        <Header home />
        <main>
          <SectionBoundary name="hero">
            <Hero selectedId={heroSite} onSelect={setHeroSite} onOpenData={openData} />
          </SectionBoundary>
          <SectionBoundary name="data">
            <NavigationData activeId={dataSite} onSelect={setDataSite} />
          </SectionBoundary>
          <SectionBoundary name="quiz">
            <Quiz onFinish={(score, total) => setResult({ score, total })} onRestart={() => setResult(null)} />
          </SectionBoundary>
          <SectionBoundary name="certificate">
            <CertificateGenerator result={result} />
          </SectionBoundary>
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;
