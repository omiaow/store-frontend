import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import MainPage from './main_page/MainPage';
import CreateShop from './shop/CreateShop';
import BranchSettings from './shop/BranchSettings';
import UpsertProduct from './product/UpsertProduct';
import UpdateShop from './shop/UpdateShop';
import ReplenishPage from './replenish/ReplenishPage';

export default function ProviderRoutes() {
    return (
        <Routes>
            <Route index element={<Navigate to="/provider/branch/store" replace />} />
            <Route path="branch" element={<Navigate to="/provider/branch/store" replace />} />
            <Route path="branch/:branchId" element={<MainPage />} />
            <Route path="branch/:branchId/replenish" element={<ReplenishPage />} />

            <Route path="shop/create" element={<CreateShop />} />
            <Route path="shop/update" element={<UpdateShop />} />
            <Route path="shop/branch-settings" element={<BranchSettings />} />
            <Route path="shop/branch/create" element={<BranchSettings mode="create" />} />
            <Route path="shop/branch/:branchId/edit" element={<BranchSettings mode="edit" />} />

            <Route path="product/create" element={<UpsertProduct />} />
            <Route path="product/:productId/edit" element={<UpsertProduct />} />

            {/* fallback */}
            <Route path="*" element={<Navigate to="/provider/branch/store" replace />} />
        </Routes>
    );
}

