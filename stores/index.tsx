import type { ReactNode } from 'react';
import { HelpdeskProvider } from './helpdesk';
import { AdminProvider } from './admin';
import { TeamProvider } from './team';
import { FieldCallProvider } from './fieldCall';

// Cross-persona demo state. Each store seeds its own data and lives for the session.
export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AdminProvider>
      <TeamProvider>
        <FieldCallProvider>
          <HelpdeskProvider>
            {children}
          </HelpdeskProvider>
        </FieldCallProvider>
      </TeamProvider>
    </AdminProvider>
  );
}
