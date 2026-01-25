import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProviderApp from './app_provider/App';
import ClientApp from './app_client/App';

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ClientApp />} />
        <Route path="/provider/*" element={<ProviderApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
