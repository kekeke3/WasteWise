import AsyncStorage from '@react-native-async-storage/async-storage';
import { PendingAction } from '../types';

const OFFLINE_QUEUE_KEY = "offline_queue";

export const offlineQueue = {
  async addAction(action: PendingAction): Promise<void> {
    const existingActions = await this.getPendingActions();
    const updatedActions = [...existingActions, action];
    await AsyncStorage.setItem(
      OFFLINE_QUEUE_KEY,
      JSON.stringify(updatedActions)
    );
  },

  async getPendingActions(): Promise<PendingAction[]> {
    const actions = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    return actions ? JSON.parse(actions) : [];
  },

  async removeAction(actionId: string): Promise<void> {
    const existingActions = await this.getPendingActions();
    const updatedActions = existingActions.filter(
      (action) => action.id !== actionId
    );
    await AsyncStorage.setItem(
      OFFLINE_QUEUE_KEY,
      JSON.stringify(updatedActions)
    );
  },

  async clearActions(): Promise<void> {
    await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
  },
};
