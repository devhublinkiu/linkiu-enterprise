import { useCallback, useEffect, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { getEcho } from '@/lib/echo';

export interface NotificationItem {
    id: string;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
}

export function useNotifications() {
    const { auth } = usePage().props as any;
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const user = auth?.user;
    const isAdmin = user?.is_superadmin || user?.role === 'admin';

    // Use a ref for dismiss so the closure inside setTimeout stays fresh
    const dismissRef = useRef<(id: string) => void>(() => {});

    const dismiss = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    dismissRef.current = dismiss;

    const push = useCallback((n: Omit<NotificationItem, 'id'>) => {
        const id = Math.random().toString(36).slice(2);
        setNotifications(prev => [...prev, { ...n, id }]);
        setTimeout(() => dismissRef.current(id), 7000);
    }, []);

    useEffect(() => {
        if (!user) return;

        let echo: ReturnType<typeof getEcho>;
        try {
            echo = getEcho();
        } catch (e) {
            console.error('[Echo] Failed to initialize:', e);
            return;
        }

        if (isAdmin) {
            echo.private('admin.notifications')
                .listen('.PaymentRequestSubmitted', (data: any) => {
                    push({
                        type: 'info',
                        title: '💳 Nueva Solicitud de Pago',
                        message: `${data.user_name} envió un comprobante para el plan ${data.plan_name}.`,
                    });
                });
        } else {
            echo.private(`associate.${user.id}`)
                .listen('.PaymentRequestReviewed', (data: any) => {
                    if (data.status === 'approved') {
                        push({
                            type: 'success',
                            title: '✅ ¡Plan Activado!',
                            message: `Tu plan ${data.plan_name} ha sido aprobado y está activo. ¡Bienvenido a CAMEP!`,
                        });
                    } else {
                        push({
                            type: 'error',
                            title: '❌ Comprobante Rechazado',
                            message: data.admin_notes
                                ? `Motivo: ${data.admin_notes}`
                                : 'Tu comprobante fue rechazado. Por favor sube uno nuevo.',
                        });
                    }
                });
        }

        return () => {
            if (isAdmin) {
                echo.leave('admin.notifications');
            } else {
                echo.leave(`associate.${user.id}`);
            }
        };
    }, [user?.id, isAdmin, push]);

    return { notifications, dismiss };
}
