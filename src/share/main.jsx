import React from 'react';
import ReactDOM from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import BuildYourShawarma from '../pages/BuildYourShawarma';
import { LocationProvider } from '../context/LocationContext';
import '../index.css';

// The wrap builder on its own, for sharing a preview link (see vite.share.config.js). It skips
// the site's header and footer, whose links only work inside the full site.
const ShareHeader = () => (
  // Clears a phone's status bar when the page runs full-screen in an app.
  <header className="fixed inset-x-0 top-0 z-30 bg-white shadow-md" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
    <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 md:h-20 md:px-8">
      <img
        src={`${import.meta.env.BASE_URL}shawarma-alley-logo.png`}
        alt="Shawarma Alley"
        className="h-12 w-auto md:h-16"
      />
      <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-primary-900 ring-1 ring-primary-200">
        Preview
      </span>
    </div>
  </header>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MemoryRouter initialEntries={['/build-your-shawarma']}>
      <LocationProvider>
        <ShareHeader />
        <BuildYourShawarma />
      </LocationProvider>
    </MemoryRouter>
  </React.StrictMode>
);
