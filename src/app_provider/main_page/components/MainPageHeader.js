import React from 'react';
import BranchPicker from './BranchPicker';

function MainPageHeader({
  branches = [],
  selectedBranchName,
  selectedBranchId,
  selectedBranch,
  isBranchPickerDisabled = false,
  onSelectBranchName,
  onEditClick,
}) {
  return (
    <header className="main-page-header">
      <div className="main-page-headerLabel">Филиал</div>

      <div className="main-page-headerRow">
        <div className="main-page-headerGrow">
          <BranchPicker
            placeholder="Все"
            branches={branches}
            selectedBranchName={selectedBranchName}
            onSelectBranchName={onSelectBranchName}
            disabled={isBranchPickerDisabled}
            hideLabel
          />
        </div>

        <div className="main-page-headerActions">
          <button
            type="button"
            className="main-page-iconButton main-page-iconButton--lg"
            onClick={onEditClick}
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

        </div>
      </div>
    </header>
  );
}

export default MainPageHeader;

