import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProviderApp from './app_provider/App';
import ClientApp from './app_client/App';
import ClientBranchesPage from './app_client/BranchesPage';
import ClientBookingPage from './app_client/BookingPage';

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/provider/*" element={<ProviderApp />} />
        <Route path="/:store/branches" element={<ClientBranchesPage />} />
        <Route path="/:store/branches/:branchId/booking" element={<ClientBookingPage />} />
        <Route path="/:store" element={<ClientApp />} />
        <Route path="/*" element={<ClientApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
