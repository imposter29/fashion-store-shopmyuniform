import './confirm-dialog.css';

/**
 * Controlled confirmation modal.
 *
 * Props:
 *  - open: boolean
 *  - title, message: strings
 *  - confirmLabel, cancelLabel: button text
 *  - onConfirm, onCancel: callbacks
 *  - danger: boolean — style confirm button as destructive
 */
const ConfirmDialog = ({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  danger = true,
}) => {
  if (!open) return null;

  return (
    <div className="confirm-overlay" onClick={onCancel} role="presentation">
      <div
        className="confirm-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <h3 className="confirm-dialog__title">{title}</h3>
        {message && <p className="confirm-dialog__message">{message}</p>}
        <div className="confirm-dialog__actions">
          <button type="button" className="btn btn-outline" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={danger ? 'btn btn-danger' : 'btn btn-primary'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
