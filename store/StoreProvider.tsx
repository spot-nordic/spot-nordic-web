'use client';

import { Provider } from 'react-redux';
import { store, persistor } from './index';
import { PersistGate } from 'redux-persist/integration/react';
import { ReactNode } from 'react';

export default function StoreProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}