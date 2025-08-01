// app/silva/page.tsx
'use client';

import ChatInterface from '@/components/widget/chat/ChatInterface';

export default function SilvaPage() {
  // Define default props or fetch data if needed
  const handleRegenerate = () => {
    console.log('Regenerate');
  };

  const handleSpeak = (text: string) => {
    console.log('Speak:', text);
  };

  const handleCopy = (text: string) => {
    console.log('Copy:', text);
  };

  return (
    <ChatInterface
      textContent="Welcome to Silva!"
      onRegenerate={handleRegenerate}
      onSpeak={handleSpeak}
      onCopy={handleCopy}
    />
  );
}