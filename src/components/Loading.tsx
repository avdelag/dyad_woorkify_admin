"use client";
    import { Loader2 } from 'lucide-react';

    export const Loading = () => {
      return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm z-[100]">
          <Loader2 className="h-12 w-12 text-brand-orange animate-spin mb-4" />
          <p className="text-lg font-medium text-foreground/80">Loading...</p>
        </div>
      );
    };