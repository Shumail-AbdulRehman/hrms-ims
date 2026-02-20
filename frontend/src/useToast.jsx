import { useState, useEffect } from 'react';

export const useToast = () => {
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3500);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const showSuccess = (msg) => setToast({ type: 'success', msg });
    const showError = (msg) => setToast({ type: 'error', msg });

    const ToastComponent = toast ? (
        <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
    ) : null;

    return { showSuccess, showError, ToastComponent };
};
