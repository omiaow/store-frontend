import React from 'react';

function StatsGrid() {

  const [stats, setStats] = React.useState({
    soldProducts: '—',
    earnedAmount: '—',
    canceled: '—',
    pending: '—',
  });

  return (
    <section className="main-page-stats" aria-label="Stats">
      <div className="main-page-statCard">
        <div className="main-page-statTitle">Проданные товары</div>
        <div className="main-page-statValue">{stats?.soldProducts ?? '—'}</div>
      </div>
      <div className="main-page-statCard">
        <div className="main-page-statTitle">Заработано</div>
        <div className="main-page-statValue">{stats?.earnedAmount ?? '—'}</div>
      </div>
      <div className="main-page-statCard">
        <div className="main-page-statTitle">Отмененные</div>
        <div className="main-page-statValue">{stats?.canceled ?? '—'}</div>
      </div>
      <div className="main-page-statCard">
        <div className="main-page-statTitle">Ожидающие</div>
        <div className="main-page-statValue">{stats?.pending ?? '—'}</div>
      </div>
    </section>
  );
}

export default StatsGrid;

