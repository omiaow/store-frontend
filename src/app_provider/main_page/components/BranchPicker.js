import React from 'react';
import { createPortal } from 'react-dom';

function BranchPicker({
  label = 'Филиал',
  placeholder = 'Все',
  branches = [],
  selectedBranchName,
  onSelectBranchName,
  disabled = false,
  hideLabel = false,
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const displayName = selectedBranchName || placeholder;

  const modal = isOpen ? (
    <div
      className="main-page-modalOverlay"
      role="dialog"
      aria-modal="true"
      aria-label="Выберите филиал"
      onClick={() => setIsOpen(false)}
    >
      <div className="main-page-modalCard" onClick={(e) => e.stopPropagation()}>
        <div className="main-page-modalHeader">
          <div className="main-page-modalTitle">Выберите филиал</div>
          <button
            type="button"
            className="main-page-modalClose"
            onClick={() => setIsOpen(false)}
            aria-label="Закрыть"
            title="Закрыть"
          >
            <svg
              className="main-page-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="main-page-modalList">
          <button
            type="button"
            className={
              selectedBranchName === null
                ? 'main-page-modalItem main-page-modalItemSelected'
                : 'main-page-modalItem'
            }
            onClick={() => {
              onSelectBranchName?.(null);
              setIsOpen(false);
            }}
          >
            {placeholder}
          </button>

          {branches.length === 0 ? (
            <div className="main-page-modalEmpty">Нет доступных филиалов.</div>
          ) : (
            branches.map((b) => (
              <button
                key={b.id ?? b.name}
                type="button"
                className={
                  selectedBranchName === b.name
                    ? 'main-page-modalItem main-page-modalItemSelected'
                    : 'main-page-modalItem'
                }
                onClick={() => {
                  onSelectBranchName?.(b.name);
                  setIsOpen(false);
                }}
              >
                {b.name}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        className="main-page-branchButton"
        onClick={() => {
          if (disabled) return;
          setIsOpen(true);
        }}
        disabled={disabled}
      >
        {hideLabel ? null : (
          <div className="main-page-branchLeft">
            <div className="main-page-branchLabel">{label}</div>
            <div
              className={
                selectedBranchName
                  ? 'main-page-branchName'
                  : 'main-page-branchName main-page-branchNamePlaceholder'
              }
            >
              {displayName}
            </div>
          </div>
        )}

        {hideLabel ? (
          <div
            className={
              selectedBranchName
                ? 'main-page-branchName'
                : 'main-page-branchName main-page-branchNamePlaceholder'
            }
          >
            {displayName}
          </div>
        ) : null}
        <div className="main-page-branchChevron" aria-hidden="true">
          ▾
        </div>
      </button>

      {modal
        ? typeof document !== 'undefined'
          ? createPortal(modal, document.body)
          : modal
        : null}
    </>
  );
}

export default BranchPicker;

