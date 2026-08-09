'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { CheckoutDialog } from '@/components/payment/CheckoutDialog';
import type { ProductId } from '@/lib/payments/catalog';
import { reachGoal } from '@/lib/analytics/metrika';
import { PAY_GOALS } from '@/lib/telegram';

type BuyButtonProps = {
    productId: ProductId;
    label: string;
    variant?: 'primary' | 'secondary' | 'accent';
    size?: 'md' | 'lg';
    className?: string;
};

export function BuyButton({
    productId,
    label,
    variant = 'accent',
    size = 'lg',
    className,
}: BuyButtonProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button
                type="button"
                variant={variant}
                size={size}
                className={className}
                onClick={() => {
                    reachGoal(PAY_GOALS.buyClick);
                    setOpen(true);
                }}
            >
                {label}
            </Button>
            <CheckoutDialog productId={productId} open={open} onClose={() => setOpen(false)} />
        </>
    );
}
