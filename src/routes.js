import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProviderApp from './app_provider/App';
import ClientApp from './app_client/App';
import ClientBranchesPage from './app_client/BranchesPage';

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/provider/*" element={<ProviderApp />} />
        <Route path="/:store/branches" element={<ClientBranchesPage />} />
        <Route path="/:store" element={<ClientApp />} />
        <Route path="/*" element={<ClientApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
