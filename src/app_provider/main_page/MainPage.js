import React from 'react';
import '../App.css';
import './MainPage.css';

import MainPageHeader from './components/MainPageHeader';
import StatsGrid from './components/StatsGrid';
import ProductsSection from './components/ProductsSection';
import useHttp from '../../hooks/http.hook';
import { useNavigate, useParams } from 'react-router-dom';

function MainPage() {
  // View-only placeholders. Replace with real data later.
  const [branches, setBranches] = React.useState([]);
  const [products, setProducts] = React.useState([]);
  const [productsLoading, setProductsLoading] = React.useState(true);
  const navigate = useNavigate();
  const params = useParams();
  const { requestWithMeta } = useHttp();
  // React 18 StrictMode runs effects twice in dev; dedupe in-flight requests
  // so we don't fire duplicate network calls and we still update state.
  const branchesPromiseRef = React.useRef(null);
  const productsPromiseByKeyRef = React.useRef(new Map());
  const lastRequestFnRef = React.useRef(null);

  const selectedBranchId =
    params.branchId && params.branchId !== 'store' ? params.branchId : null;

  const selectedBranch = React.useMemo(() => {
    if (!selectedBranchId) return null;
    // `useParams()` returns strings; API ids may be numbers.
    const selectedKey = String(selectedBranchId);
    return (
      branches.find((b) => {
        const id = b?._id ?? b?.id;
        if (id === undefined || id === null) return false;
        return String(id) === selectedKey;
      }) || null
    );
  }, [branches, selectedBranchId]);

  const selectedBranchName = selectedBranch?.name ?? null;
  const isBranchPickerDisabled = branches.length <= 1;

  const handleProductDeleted = React.useCallback((deletedId) => {
    if (!deletedId) return;
    setProducts((prev) =>
      prev.filter((p) => {
        const pid = p?._id ?? p?.id;
        return pid !== deletedId;
      })
    );
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    if (lastRequestFnRef.current !== requestWithMeta) {
      lastRequestFnRef.current = requestWithMeta;
      branchesPromiseRef.current = null;
      productsPromiseByKeyRef.current = new Map();
    }

    const branchesPromise =
      branchesPromiseRef.current ??
      (branchesPromiseRef.current = requestWithMeta('/operator/branches', 'GET'));

    (async () => {
      try {
        const branchesRes = await branchesPromise;

        if (cancelled) return;

        if (branchesRes?.status === 404) {
          navigate('/provider/shop/create', { replace: true });
          return;
        }

        if (branchesRes?.ok) {
          const data = branchesRes?.data;
          const listRaw = Array.isArray(data)
            ? data
            : Array.isArray(data?.branches)
              ? data.branches
              : [];

          const normalized = listRaw.map((b) => {
            const id = b?._id ?? b?.id;
            return { ...b, _id: id, id };
          });

          setBranches(normalized);
        }
      } catch (_) {
        // ignore for now (view-first app)
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [requestWithMeta, navigate]);

  React.useEffect(() => {
    let cancelled = false;

    if (lastRequestFnRef.current !== requestWithMeta) {
      lastRequestFnRef.current = requestWithMeta;
      branchesPromiseRef.current = null;
      productsPromiseByKeyRef.current = new Map();
    }

    const key = selectedBranchId ? `branch:${selectedBranchId}` : 'all';
    const endpoint = selectedBranchId
      ? `/operator/products?branchId=${encodeURIComponent(selectedBranchId)}`
      : '/operator/products';

    setProductsLoading(true);

    const cachedPromise = productsPromiseByKeyRef.current.get(key);
    const productsPromise = cachedPromise ?? requestWithMeta(endpoint, 'GET');
    if (!cachedPromise) {
      productsPromiseByKeyRef.current.set(key, productsPromise);
    }

    (async () => {
      try {
        const productsRes = await productsPromise;
        if (cancelled) return;

        if (productsRes?.ok) {
          const data = productsRes?.data;
          const listRaw = Array.isArray(data)
            ? data
            : Array.isArray(data?.products)
              ? data.products
              : [];

          const normalized = listRaw.map((p) => {
            const id = p?._id ?? p?.id;
            return {
              ...p,
              _id: id,
              id,
              imageUrl: p?.imageUrl ?? p?.image_url ?? null,
            };
          });

          setProducts(normalized);
        }
      } catch (_) {
        // ignore for now (view-first app)
      } finally {
        if (!cancelled) setProductsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [requestWithMeta, selectedBranchId]);

  React.useEffect(() => {
    // Navigation decisions based on already-fetched branches + current route.
    if (!Array.isArray(branches) || branches.length === 0) return;

    if (branches.length === 1) {
      const onlyId = branches[0]?._id ?? branches[0]?.id;
      if (!onlyId) return;
      if (String(params.branchId) === String(onlyId)) return;
      navigate(`/provider/branch/${onlyId}`, { replace: true });
      return;
    }

    if (!params.branchId) {
      navigate('/provider/branch/store', { replace: true });
    }
  }, [branches, params.branchId, navigate]);

  return (
    <div className="main-page-root">
      <div className="main-page-mobile">
        <MainPageHeader
          branches={branches}
          selectedBranchName={selectedBranchName}
          selectedBranchId={selectedBranchId}
          selectedBranch={selectedBranch}
          isBranchPickerDisabled={isBranchPickerDisabled}
          onSelectBranchName={(nameOrNull) => {
            if (nameOrNull === null) {
              navigate('/provider/branch/store');
              return;
            }
            const found = branches.find((b) => b?.name === nameOrNull);
            const id = found?._id ?? found?.id;
            if (id) navigate(`/provider/branch/${id}`);
          }}
          onEditClick={() => {
            if (!selectedBranchId) {
              navigate('/provider/shop/update');
              return;
            }
            navigate(`/provider/shop/branch/${selectedBranchId}/edit`, {
              state: { branch: selectedBranch },
            });
          }}
          onCreateBranchClick={() => navigate('/provider/shop/branch/create')}
        />

        <main className="main-page-content">
          <StatsGrid />
          <ProductsSection
            products={products}
            loading={productsLoading}
            selectedBranchId={selectedBranchId}
            onOpenReplenish={() => {
              if (!selectedBranchId) return;
              navigate(`/provider/branch/${selectedBranchId}/replenish`);
            }}
            onProductDeleted={handleProductDeleted}
          />
        </main>

        <footer className="main-page-footer">
          <button
            type="button"
            className="main-page-addButton"
            onClick={() => navigate('/provider/product/create')}
          >
            + Добавить продукт
          </button>
        </footer>
      </div>
    </div>
  );
}

export default MainPage;

