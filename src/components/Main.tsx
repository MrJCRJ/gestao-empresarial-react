// src/components/Main.tsx
import { ComponentType } from 'react';

interface MainProps {
  ActiveComponent: ComponentType;
}

export default function Main({ ActiveComponent }: MainProps) {
  return (
    <main>
      <ActiveComponent />
    </main>
  );
}
