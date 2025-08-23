'use client';

import ChatInterface from '@/components/widget/chat/ChatInterface';
import { Suspense } from 'react';

export default function SilvaPage() {
  // Define default props or fetch data if needed
  const handleRegenerate = () => {
    // console.log('Regenerate');
  };

  const handleSpeak = (text: string) => {
    // console.log('Speak:', text);
  };

  const handleCopy = (text: string) => {
    // console.log('Copy:', text);
  };

  return (
    <Suspense>
      <ChatInterface
        textContent="Welcome to Cura AI!"
        onRegenerate={handleRegenerate}
        onSpeak={handleSpeak}
        onCopy={handleCopy}
      />
    </Suspense>
  );
}