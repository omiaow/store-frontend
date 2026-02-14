import React from 'react';
import { useParams } from 'react-router-dom';
import useHttp from '../../../hooks/http.hook';

function StatsGrid() {
  const { requestWithMeta } = useHttp();
  const params = useParams();
  const statsPromiseRef = React.useRef(null);
  const lastRequestFnRef = React.useRef(null);
  const lastBranchKeyRef = React.useRef(null);
  const [loading, setLoading] = React.useState(true);

  const [stats, setStats] = React.useState({
    soldProducts: '—',
    earnedAmount: '—',
    totalOrders: '—',
    canceledOrders: '—',
  });

  React.useEffect(() => {
    let cancelled = false;

    const branchKey = params.branchId || 'store';

    // If auth/token changes, requestWithMeta callback identity changes.
    // In that case, clear cached promise so we refetch with new credentials.
    if (lastRequestFnRef.current !== requestWithMeta) {
      lastRequestFnRef.current = requestWithMeta;
      statsPromiseRef.current = null;
      lastBranchKeyRef.current = branchKey;
    }

    // If route branch changes, refetch stats.
    if (lastBranchKeyRef.current !== branchKey) {
      lastBranchKeyRef.current = branchKey;
      statsPromiseRef.current = null;
    }

    setLoading(true);
    setStats({
      soldProducts: '—',
      earnedAmount: '—',
      totalOrders: '—',
      canceledOrders: '—',
    });

    const statsPromise =
      statsPromiseRef.current ??
      (statsPromiseRef.current = requestWithMeta(
        `/operator/stats/branch/${branchKey}`,
        'GET'
      ));

    (async () => {
      try {
        const res = await statsPromise;
        if (cancelled) return;
        if (!res?.ok) return;

        const data = res?.data;
        const s = data?.stats || {};

        const soldQuantity = Number(s?.soldQuantity ?? 0);
        const soldRevenue = Number(s?.soldRevenue ?? 0);
        const totalOrders = Number(s?.totalOrders ?? 0);
        const canceledOrders = Number(s?.canceledOrders ?? 0);

        const nf = new Intl.NumberFormat('ru-RU');

        setStats({
          soldProducts: nf.format(Number.isFinite(soldQuantity) ? soldQuantity : 0),
          earnedAmount: nf.format(Number.isFinite(soldRevenue) ? soldRevenue : 0),
          totalOrders: nf.format(Number.isFinite(totalOrders) ? totalOrders : 0),
          canceledOrders: nf.format(Number.isFinite(canceledOrders) ? canceledOrders : 0),
        });
      } catch (_) {
        // ignore for now (view-first app)
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [requestWithMeta, params.branchId]);

  return (
    <section className="main-page-stats" aria-label="Stats" aria-busy={loading}>
      {loading ? (
        <>
          <div className="main-page-statCard main-page-statCard--skeleton" aria-hidden="true">
            <div className="main-page-skeleton main-page-skeleton--text main-page-statTitleSkeleton" />
            <div className="main-page-skeleton main-page-skeleton--text main-page-statValueSkeleton" />
          </div>
          <div className="main-page-statCard main-page-statCard--skeleton" aria-hidden="true">
            <div className="main-page-skeleton main-page-skeleton--text main-page-statTitleSkeleton" />
            <div className="main-page-skeleton main-page-skeleton--text main-page-statValueSkeleton" />
          </div>
          <div className="main-page-statCard main-page-statCard--skeleton" aria-hidden="true">
            <div className="main-page-skeleton main-page-skeleton--text main-page-statTitleSkeleton" />
            <div className="main-page-skeleton main-page-skeleton--text main-page-statValueSkeleton" />
          </div>
          <div className="main-page-statCard main-page-statCard--skeleton" aria-hidden="true">
            <div className="main-page-skeleton main-page-skeleton--text main-page-statTitleSkeleton" />
            <div className="main-page-skeleton main-page-skeleton--text main-page-statValueSkeleton" />
          </div>
        </>
      ) : (
        <>
          <div className="main-page-statCard">
            <div className="main-page-statTitle">Продано</div>
            <div className="main-page-statValue">{stats?.soldProducts ?? '—'}</div>
          </div>
          <div className="main-page-statCard">
            <div className="main-page-statTitle">Денег на кассе</div>
            <div className="main-page-statValue">{stats?.earnedAmount ?? '—'}</div>
          </div>
          <div className="main-page-statCard">
            <div className="main-page-statTitle">Заказы</div>
            <div className="main-page-statValue">{stats?.totalOrders ?? '—'}</div>
          </div>
          <div className="main-page-statCard">
            <div className="main-page-statTitle">Отменено</div>
            <div className="main-page-statValue">{stats?.canceledOrders ?? '—'}</div>
          </div>
        </>
      )}
    </section>
  );
}

export default StatsGrid;

