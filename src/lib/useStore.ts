import { useSyncExternalStore } from 'react'
import { store } from './store'

export function useStore() {
  return useSyncExternalStore(store.subscribe, store.get, store.get)
}
