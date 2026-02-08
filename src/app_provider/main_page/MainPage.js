import React from 'react';
import '../App.css';
import './MainPage.css';

import BranchPicker from './components/BranchPicker';
import StatsGrid from './components/StatsGrid';
import ProductsSection from './components/ProductsSection';
import useHttp from '../../hooks/http.hook';
import { useNavigate, useParams } from 'react-router-dom';

function MainPage() {
  // View-only placeholders. Replace with real data later.
  const [branches, setBranches] = React.useState([]);
  const [products, setProducts] = React.useState([]);
  const navigate = useNavigate();
  const params = useParams();
  const { requestWithMeta } = useHttp();

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

  const handleProductUpdated = React.useCallback((updated) => {
    const updatedId = updated?._id ?? updated?.id;
    if (!updatedId) return;

    setProducts((prev) =>
      prev.map((p) => {
        const pid = p?._id ?? p?.id;
        if (pid !== updatedId) return p;
        return {
          ...p,
          ...updated,
          _id: updatedId,
          id: updatedId,
          imageUrl:
            updated?.imageUrl ??
            updated?.image_url ??
            p?.imageUrl ??
            p?.image_url ??
            null,
        };
      })
    );
  }, []);

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
    let isMounted = true;

    async function loadBranches() {
      try {
        if (!isMounted) return;
        const res = await requestWithMeta('/operator/branches', 'GET');

        if (!isMounted) return;

        if (res?.status === 404) {
          navigate('/provider/shop/create', { replace: true });
          return;
        }

        // For other non-OK statuses, just keep empty list for now.
        if (!res?.ok) return;

        const data = res?.data;
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

        if (normalized.length === 1) {
          const onlyId = normalized[0]?._id ?? normalized[0]?.id;
          if (onlyId) navigate(`/provider/branch/${onlyId}`, { replace: true });
        } else if (!params.branchId) {
          navigate('/provider/branch/store', { replace: true });
        }
      } catch (_) {
        // ignore for now (view-first app)
      }
    }

    loadBranches();
    return () => {
      isMounted = false;
    };
  }, [requestWithMeta, navigate, params.branchId]);

  React.useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        if (!isMounted) return;
        const res = await requestWithMeta('/operator/products', 'GET');
        if (!isMounted) return;

        if (!res?.ok) return;

        const data = res?.data;
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
      } catch (_) {
        // ignore for now (view-first app)
      }
    }

    loadProducts();
    return () => {
      isMounted = false;
    };
  }, [requestWithMeta]);

  return (
    <div className="main-page-root">
      <div className="main-page-mobile">
        <header className="main-page-header">
          <div className="main-page-headerLabel">Филиал</div>

          <div className="main-page-headerRow">
            <div className="main-page-headerGrow">
              <BranchPicker
                placeholder="Все"
                branches={branches}
                selectedBranchName={selectedBranchName}
                onSelectBranchName={(nameOrNull) => {
                  if (nameOrNull === null) {
                    navigate('/provider/branch/store');
                    return;
                  }
                  const found = branches.find((b) => b?.name === nameOrNull);
                  const id = found?._id ?? found?.id;
                  if (id) navigate(`/provider/branch/${id}`);
                }}
                disabled={isBranchPickerDisabled}
                hideLabel
              />
            </div>

            <div className="main-page-headerActions">
              <button
                type="button"
                className="main-page-iconButton main-page-iconButton--lg"
                onClick={() => {
                  if (!selectedBranchId) {
                    navigate('/provider/shop/update');
                    return;
                  }
                  navigate(`/provider/shop/branch/${selectedBranchId}/edit`, {
                    state: { branch: selectedBranch },
                  });
                }}
                aria-label={selectedBranchId ? 'Обновить филиал' : 'Обновить магазин'}
                title={selectedBranchId ? 'Обновить филиал' : 'Обновить магазин'}
              >
                <svg
                  className="main-page-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M4 20h4l10.5-10.5a1.5 1.5 0 0 0 0-2.1l-1.9-1.9a1.5 1.5 0 0 0-2.1 0L4 15.9V20z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M13.5 6.5l4 4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              <button
                type="button"
                className="main-page-iconButton main-page-iconButton--lg"
                onClick={() => navigate('/provider/shop/branch/create')}
                aria-label="Создать филиал"
                title="Создать филиал"
              >
                <svg
                  className="main-page-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M12 5V19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M5 12H19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </header>

        <main className="main-page-content">
          <StatsGrid/>
          <ProductsSection
            products={products}
            selectedBranchId={selectedBranchId}
            onProductUpdated={handleProductUpdated}
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

