'use client';

import { useState } from 'react';
import {
  Loader2,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  ShieldCheck,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface CheckoutPlan {
  code: string;
  name: string;
  monthlyPricePaise: number;
  yearlyPricePaise?: number | null;
}

const rupees = (paise: number) => (paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 });

/**
 * The three test cards the mock gateway recognises. Shown directly in the
 * checkout UI — there is no real gateway account to log into, so this is
 * how a developer or reviewer knows what to type to exercise each outcome.
 */
const TEST_CARDS = [
  { number: '4111 1111 1111 1111', label: 'Always succeeds' },
  { number: '4000 0000 0000 0002', label: 'Always declined' },
  { number: '4000 0000 0000 0119', label: 'Pending, then settles' },
];

type Stage = 'form' | 'processing' | 'success' | 'declined' | 'pending';

export function CheckoutDialog({
  plan,
  billingPeriod,
  open,
  onOpenChange,
  onSuccess,
}: {
  plan: CheckoutPlan;
  billingPeriod: 'MONTHLY' | 'YEARLY';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [stage, setStage] = useState<Stage>('form');
  const [cardNumber, setCardNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Carried across the pending -> "check again" step, since re-verifying
  // doesn't need a new order or a new charge — the same payment just hasn't
  // settled yet.
  const [pendingRef, setPendingRef] = useState<{ orderId: string; gatewayPaymentId: string; signature: string } | null>(null);

  const price = billingPeriod === 'YEARLY' && plan.yearlyPricePaise ? plan.yearlyPricePaise : plan.monthlyPricePaise;

  const reset = () => {
    setStage('form');
    setCardNumber('');
    setErrorMessage('');
    setPendingRef(null);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) reset();
    onOpenChange(isOpen);
  };

  const pay = async () => {
    setStage('processing');
    setErrorMessage('');
    try {
      const order = (await apiClient.post('/vendor/payments/orders', {
        planCode: plan.code,
        billingPeriod,
      })).data;

      const charge = (await apiClient.post('/payments/mock/charge', {
        gatewayOrderId: order.gatewayOrderId,
        cardNumber: cardNumber.replace(/\s+/g, ''),
      })).data;

      // Always confirmed with the backend, even on a decline — this is what
      // actually records the FAILED transaction in the vendor's payment
      // history and the audit trail; skipping it here would make every
      // declined attempt invisible everywhere except this dialog.
      const verify = (await apiClient.post('/vendor/payments/verify', {
        orderId: order.orderId,
        gatewayPaymentId: charge.gatewayPaymentId,
        signature: charge.signature,
      })).data;

      if (verify.status === 'SUCCESS') {
        setStage('success');
        toast.success(`You're now on the ${plan.name} plan`);
      } else if (verify.status === 'PENDING') {
        setPendingRef({ orderId: order.orderId, gatewayPaymentId: charge.gatewayPaymentId, signature: charge.signature });
        setStage('pending');
      } else {
        setErrorMessage(verify.message || 'Payment could not be completed.');
        setStage('declined');
      }
    } catch (error: any) {
      console.error('Checkout failed:', error);
      setErrorMessage(error?.response?.data?.error || 'Something went wrong. Please try again.');
      setStage('declined');
    }
  };

  const checkPendingAgain = async () => {
    if (!pendingRef) return;
    setStage('processing');
    try {
      const verify = (await apiClient.post('/vendor/payments/verify', pendingRef)).data;
      if (verify.status === 'SUCCESS') {
        setStage('success');
        toast.success(`You're now on the ${plan.name} plan`);
      } else if (verify.status === 'PENDING') {
        setStage('pending');
        toast.info('Still processing — try again in a moment.');
      } else {
        setErrorMessage(verify.message || 'Payment could not be completed.');
        setStage('declined');
      }
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.error || 'Could not check payment status.');
      setStage('declined');
    }
  };

  const fillCard = (number: string) => {
    setCardNumber(number);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {stage === 'success' ? 'Payment successful' : stage === 'declined' ? 'Payment failed'
              : stage === 'pending' ? 'Payment processing' : `Subscribe to ${plan.name}`}
          </DialogTitle>
          <DialogDescription>
            {stage === 'form' && `${billingPeriod === 'YEARLY' ? 'Yearly' : 'Monthly'} billing · simulated checkout, no real card required`}
          </DialogDescription>
        </DialogHeader>

        {stage === 'form' && (
          <div className="space-y-5">
            <div className="rounded-xl bg-[#FDFBF7] border border-[#CDC0B0]/40 p-4 flex items-center justify-between">
              <div>
                <p className="font-body text-sm text-[#6B5E54]">{plan.name} plan</p>
                <p className="font-body text-xs text-[#9C8E82]">{billingPeriod === 'YEARLY' ? 'Billed yearly' : 'Billed monthly'}</p>
              </div>
              <p className="font-heading text-2xl font-bold text-[#2C2621]">₹{rupees(price)}</p>
            </div>

            <div>
              <Label htmlFor="cardNumber" className="mb-2 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" /> Card number
              </Label>
              <Input
                id="cardNumber"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="4111 1111 1111 1111"
                className="h-11 font-mono tracking-wide"
              />
            </div>

            <div className="space-y-1.5">
              <p className="font-body text-xs font-medium text-[#6B5E54]">Test cards — tap to fill</p>
              {TEST_CARDS.map((card) => (
                <button
                  key={card.number}
                  type="button"
                  onClick={() => fillCard(card.number)}
                  className="w-full flex items-center justify-between rounded-lg border border-[#CDC0B0]/50 px-3 py-2 text-left hover:bg-[#FDFBF7] transition-colors"
                >
                  <span className="font-mono text-xs text-[#2C2621]">{card.number}</span>
                  <span className="font-body text-xs text-[#9C8E82]">{card.label}</span>
                </button>
              ))}
            </div>

            <p className="flex items-center gap-1.5 font-body text-xs text-[#9C8E82]">
              <ShieldCheck className="w-3.5 h-3.5" />
              Simulated gateway — no real payment is processed.
            </p>

            <Button
              onClick={pay}
              disabled={!cardNumber.trim()}
              className="w-full h-12 rounded-xl bg-[#C4975A] hover:bg-[#B38549] text-white"
            >
              Pay ₹{rupees(price)}
            </Button>
          </div>
        )}

        {stage === 'processing' && (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="w-10 h-10 animate-spin text-[#C4975A] mb-4" />
            <p className="font-body text-sm text-[#6B5E54]">Processing your payment…</p>
          </div>
        )}

        {stage === 'success' && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#5B8C5A]/12 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-9 h-9 text-[#5B8C5A]" />
            </div>
            <p className="font-heading font-bold text-lg text-[#2C2621]">You're on {plan.name}</p>
            <p className="font-body text-sm text-[#6B5E54] mt-1">Your new limits and features are active immediately.</p>
            <Button onClick={() => { reset(); onSuccess(); }} className="mt-6 w-full h-11 rounded-xl bg-[#2C2621] hover:bg-[#2C2621]/90 text-white">
              Done
            </Button>
          </div>
        )}

        {stage === 'declined' && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#B85C5C]/12 flex items-center justify-center mb-4">
              <XCircle className="w-9 h-9 text-[#B85C5C]" />
            </div>
            <p className="font-heading font-bold text-lg text-[#2C2621]">Payment failed</p>
            <p className="font-body text-sm text-[#6B5E54] mt-1">{errorMessage}</p>
            <div className="flex gap-2 w-full mt-6">
              <Button variant="outline" onClick={() => handleClose(false)} className="flex-1 h-11 rounded-xl">
                Cancel
              </Button>
              <Button onClick={reset} className="flex-1 h-11 rounded-xl bg-[#2C2621] hover:bg-[#2C2621]/90 text-white">
                Try again
              </Button>
            </div>
          </div>
        )}

        {stage === 'pending' && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#C4975A]/12 flex items-center justify-center mb-4">
              <Clock className="w-9 h-9 text-[#C4975A]" />
            </div>
            <p className="font-heading font-bold text-lg text-[#2C2621]">Still processing</p>
            <p className="font-body text-sm text-[#6B5E54] mt-1">
              This payment method settles a little after the charge. Check again in a moment.
            </p>
            <Button onClick={checkPendingAgain} className="mt-6 w-full h-11 rounded-xl bg-[#C4975A] hover:bg-[#B38549] text-white">
              Check again
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
