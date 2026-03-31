'use client';

export function Toast({ message }: { message: string }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 bg-ink text-white px-4 py-3 rounded-lg text-sm font-body z-50 animate-pulse">
      {message}
    </div>
  );
}
