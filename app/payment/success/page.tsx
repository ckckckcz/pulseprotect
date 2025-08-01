// app/payment/success/page.tsx
import { Suspense } from "react";
import PaymentSuccessClient from "@/app/payment/client";

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccessClient />
    </Suspense>
  );
}
