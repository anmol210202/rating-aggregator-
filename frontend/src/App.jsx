import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FaCopy, FaExternalLinkAlt } from 'react-icons/fa';
// import { FaCopy, FaExternalLinkAlt, SiStremio } from 'react-icons/fa';
import { toast } from 'react-toastify';
import ConfigSection from './components/ConfigSection';
import RatingsConfig from './components/Configurator/RatingsConfig';
import ParentalConfig from './components/Configurator/ParentalConfig';
import MDBListConfig from './components/Configurator/MDBListConfig';
import PreviewCard from './components/PreviewCard';
import { generateManifestUrl } from './utils/configUtils';
import './App.css';

function App() {
  const [config, setConfig] = useState({
    ratings: {
      age: { enabled: true, order: 1 },
      imdb: { enabled: true, order: 2 },
      tmdb: { enabled: true, order: 3 },
      metacritic: { enabled: true, order: 4 },
      mcUsers: { enabled: true, order: 5 },
      cringemdb: { enabled: true, order: 6 }
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

  useEffect(() => {
    setManifestUrl(generateManifestUrl(config));
  }, [config]);

  const handleConfigChange = (section, updates) => {
    setConfig(prev => ({
      ...prev,
      [section]: { ...prev[section], ...updates }
    }));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(manifestUrl);
    toast.success('Manifest URL copied!');
  };

  const handleStremioOpen = () => {
    const deepLink = manifestUrl.replace(/^https?:\/\//i, 'stremio://');
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
            Ratings Aggregator Configurator
          </motion.h1>
          <p className="mt-4 text-gray-300 max-w-2xl mx-auto">
            Customize how ratings appear in Stremio. Toggle sources, set display order,
            and configure parental guidance features.
          </p>
        </header>

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
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <PreviewCard config={config} />

              <div className="mt-6 bg-gray-800/50 backdrop-blur p-6 rounded-xl border border-gray-700">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  {/* <SiStremio className="text-purple-400" /> */}
                  Install to Stremio
                </h3>

                <div className="mb-4 p-3 bg-gray-900 rounded-lg text-sm break-all">
                  {manifestUrl}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleCopy}
                    className="flex-1 py-3 px-4 bg-cyan-600 hover:bg-cyan-700 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <FaCopy /> Copy URL
                  </button>
                  <button
                    onClick={handleStremioOpen}
                    className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    {/* <SiStremio />  */}
                    Open Stremio
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-16 text-center text-gray-500 text-sm">
          Made with ❤️ for the Stremio community
        </footer>
      </motion.div>
    </div>
  );
}

export default App;