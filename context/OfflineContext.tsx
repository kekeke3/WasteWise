import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { offlineQueue } from '../storage/offlineQueue';
import { PendingAction } from '../types';

interface OfflineContextType {
  pendingActions: PendingAction[];
  addPendingAction: (
    action: Omit<PendingAction, "id" | "timestamp" | "status">
  ) => Promise<void>;
  clearPendingActions: () => Promise<void>;
  isOnline: boolean;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    loadPendingActions();
  }, []);

  useEffect(() => {
    if (isOnline && pendingActions.length > 0) {
      syncPendingActions();
    }
  }, [isOnline]);

  const loadPendingActions = async (): Promise<void> => {
    const actions = await offlineQueue.getPendingActions();
    setPendingActions(actions);
  };

  const addPendingAction = async (
    action: Omit<PendingAction, "id" | "timestamp" | "status">
  ): Promise<void> => {
    const newAction: PendingAction = {
      ...action,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      status: "pending",
    };

    await offlineQueue.addAction(newAction);
    setPendingActions((prev) => [...prev, newAction]);
  };

  const syncPendingActions = async (): Promise<void> => {
    const actions = await offlineQueue.getPendingActions();

    for (const action of actions) {
      try {
        // Implement your sync logic here based on action type
        console.log("Syncing action:", action);

        // Remove from queue after successful sync
        await offlineQueue.removeAction(action.id);
      } catch (error) {
        console.error("Failed to sync action:", error);
      }
    }

    setPendingActions([]);
  };

  const clearPendingActions = async (): Promise<void> => {
    await offlineQueue.clearActions();
    setPendingActions([]);
  };

  return (
    <OfflineContext.Provider
      value={{
        pendingActions,
        addPendingAction,
        clearPendingActions,
        isOnline,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = (): OfflineContextType => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error("useOffline must be used within OfflineProvider");
  }
  return context;
};
