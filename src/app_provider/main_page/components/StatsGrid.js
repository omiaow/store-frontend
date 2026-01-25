import React from 'react';

function StatsGrid({ stats }) {
  return (
    <section className="main-page-stats" aria-label="Stats">
      <div className="main-page-statCard">
        <div className="main-page-statTitle">Sold products</div>
        <div className="main-page-statValue">{stats?.soldProducts ?? '—'}</div>
      </div>
      <div className="main-page-statCard">
        <div className="main-page-statTitle">Earned amount</div>
        <div className="main-page-statValue">{stats?.earnedAmount ?? '—'}</div>
      </div>
      <div className="main-page-statCard">
        <div className="main-page-statTitle">Canceled</div>
        <div className="main-page-statValue">{stats?.canceled ?? '—'}</div>
      </div>
      <div className="main-page-statCard">
        <div className="main-page-statTitle">Pending</div>
        <div className="main-page-statValue">{stats?.pending ?? '—'}</div>
      </div>
    </section>
  );
}

export default StatsGrid;

