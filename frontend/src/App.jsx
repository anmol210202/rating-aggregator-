import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FaCopy, FaExternalLinkAlt } from 'react-icons/fa';
// import { FaCopy, FaExternalLinkAlt, SiStremio } from 'react-icons/fa';
import { toast } from 'react-toastify';
import ConfigSection from './components/ConfigSection';
import { initGTM } from './utils/gtm';
import showCase from './assets/showcase.png';
import RatingsConfig from './components/Configurator/RatingsConfig';
import ParentalConfig from './components/Configurator/ParentalConfig';
import MDBListConfig from './components/Configurator/MDBListConfig';
import AddonManagerCard from './components/AddonManagerCard'
import RatingCard from './components/RatingCard';
import PreviewCard from './components/PreviewCard';
import { generateManifestUrl } from './utils/configUtils';
import './App.css';

const SponsorBanner = ({ html }) => {
  return (
    <motion.div
      className="relative mx-auto mt-6 bg-[#0f1a2f] text-sm sm:text-base text-gray-200 px-6 py-4 rounded-xl shadow max-w-2xl backdrop-blur border border-white/5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <div
        className="sponsor-content flex items-start gap-4 text-left"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </motion.div>
  );
};

function App() {
  const sponsorHTML = process.env.VITE_HOME_BLURB;
  const [config, setConfig] = useState({
    ratings: {
      age: { enabled: true, order: 1 },
      imdb: { enabled: true, order: 2 },
      tmdb: { enabled: true, order: 3 },
      metacritic: { enabled: true, order: 4 },
      mcUsers: { enabled: true, order: 5 },
      rt: { enabled: true, order: 6 },
      rtUsers: { enabled: true, order: 7 },
      cringemdb: { enabled: true, order: 8 }
    },
    parental: {
      ageRating: true,
      contentWarnings: true,
      nudityWarning: true
    },
    mdbList: {
      apiKey: '',
      enabled: false
    }
  });

  const [manifestUrl, setManifestUrl] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    setManifestUrl(generateManifestUrl(config));
  }, [config]);

  useEffect(() => {
    // Initialize Google Tag Manager
    initGTM();
    // push initial pageview event
    window.dataLayer.push({ event: 'pageview', page: window.location.pathname });
  }, []);

  const handleConfigChange = (section, updates) => {
    setConfig(prev => ({
      ...prev,
      [section]: { ...prev[section], ...updates }
    }));
  };

  const handleCopy = () => {
    const absoluteUrl = new URL(manifestUrl, window.location.origin).href;
    navigator.clipboard.writeText(absoluteUrl)
      .then(() => toast.success('Manifest URL copied!'))
      .catch(() => toast.error('Failed to copy URL'));
  };

  const handleStremioWebOpen = () => {
    const url = new URL(manifestUrl, window.location.origin).href;
    window.open(`https://web.stremio.com/#/addons?addon=${encodeURIComponent(url)}`, '_blank');
  };

  const handleStremioOpen = () => {
    const absoluteManifestUrl = new URL(manifestUrl, window.location.origin).href;
    const deepLink = absoluteManifestUrl.replace(/^https?:\/\//i, 'stremio://');
    window.location.href = deepLink;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <header className="text-center mb-12">
          <motion.h1
            className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Ratings Aggregator 
          </motion.h1>
          <p className="mt-4 text-gray-300 max-w-2xl mx-auto">
            Your all-in-one movie and TV show ratings aggregator for Stremio
          </p>
          <p className="mt-4 text-gray-300 max-w-2xl mx-auto">
            Customize how ratings appear in Stremio. Toggle sources, set display order,
            and configure parental guidance features.
          </p>
          {sponsorHTML && <SponsorBanner html={sponsorHTML} />}

        </header>

        <motion.div
          className="mb-16 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <img
            src={showCase}
            alt="Showcase"
            className="w-full max-w-sm h-auto rounded-lg shadow-lg"
          />
        </motion.div>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <RatingCard
            title="Multi-Source Ratings"
            description="Aggregate scores from IMDb, TMDb, Metacritic & more"
            icon="📊"
          />
          <RatingCard
            title="Parental Guidance"
            description="Age ratings & content warnings from Common Sense Media"
            icon="👪"
          />
          <RatingCard
            title="Content Insights"
            description="Detailed content analysis from CringeMDB"
            icon="🔍"
          />
        </section>



        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-2 space-y-6">
            <ConfigSection
              title="📊 Ratings Sources"
              icon="⭐"
              description="Select which ratings to display and set their order"
            >
              <RatingsConfig
                config={config.ratings}
                onChange={(updates) => handleConfigChange('ratings', updates)}
              />
            </ConfigSection>

            <ConfigSection
              title="👪 Parental Guidelines"
              icon="🔞"
              description="Configure content warnings and age ratings"
            >
              <ParentalConfig
                config={config.parental}
                onChange={(updates) => handleConfigChange('parental', updates)}
              />
            </ConfigSection>

            <ConfigSection
              title="🎬 MDBList Integration"
              icon="🎥"
              description="Add your MDBList API key for enhanced data"
            >
              <MDBListConfig
                config={config.mdbList}
                onChange={(updates) => handleConfigChange('mdbList', updates)}
              />
            </ConfigSection>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1 z-50">
            <div className="sticky top-4 z-10">
              <PreviewCard config={config} />

              <div className="mt-6 bg-gray-800/50 backdrop-blur p-6 rounded-xl border border-gray-700">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  {/* <SiStremio className="text-purple-400" /> */}
                  Install to Stremio
                </h3>

                <div className="mb-4 p-3 bg-gray-900 rounded-lg text-sm break-all">
                  {manifestUrl}
                </div>

                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={handleCopy}
                    className="flex-1 py-3 px-4 bg-cyan-600 hover:bg-cyan-700 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <FaCopy /> Copy URL
                  </button>

                  <div className="relative flex-1">
                    <button
                      onClick={() => setDropdownOpen((prev) => !prev)}
                      className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      📥 Install to Stremio ▾
                    </button>

                    {dropdownOpen && (
                      <div className="absolute z-10 mt-2 w-full rounded-lg overflow-hidden shadow-lg bg-gray-900 border border-gray-700">
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            handleStremioWebOpen();
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-800 transition-colors"
                        >
                          🌐 Open in Stremio Web
                        </button>
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            handleStremioOpen();
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-800 transition-colors"
                        >
                          📱 Open in Stremio App
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-7"></div>
          <AddonManagerCard />
        <footer className="mt-16 text-center text-gray-500 text-sm">
          Made with ❤️ for the Stremio community
        </footer>
      </motion.div>
    </div>
  );
}

export default App;