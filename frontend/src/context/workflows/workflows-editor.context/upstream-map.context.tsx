import React, { useCallback } from "react";
import localForage from "services/config/local-forage.config";
import { createCustomContext } from "utils";

export interface IUpstreamMapContext {
  getForageUpstreamMap: () => Promise<any> // TODO add type
  setForageUpstreamMap: (data: any) => Promise<void> // TODO add type
  clearForageUpstreamMap: () => Promise<void>
  removeForageUpstreamMapById: (id: string) => Promise<void>

  setNameKeyUpstreamArgsMap: (nameKeyUpstreamArgsMap: any) => Promise<void> // TODO add type
  getNameKeyUpstreamArgsMap: () => Promise<any> // TODO add type
  clearNameKeyUpstreamArgsMap: () => Promise<void>
}

export const [UpstreamMapContext, useUpstreamMap] =
  createCustomContext<IUpstreamMapContext>('upstreamMap Context')

const UpstreamMapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  // Mapping state to map upstream dropdown names to upstream real keys
  const setNameKeyUpstreamArgsMap = useCallback(async (nameKeyUpstreamArgsMap: any) => {
    await localForage.setItem('nameKeyUpstreamArgsMap', nameKeyUpstreamArgsMap)
  }, [])

  const getNameKeyUpstreamArgsMap = useCallback(async () => {
    const nameKeyUpstreamArgsMap = await localForage.getItem<any>('nameKeyUpstreamArgsMap')
    if (!nameKeyUpstreamArgsMap) {
      return {}
    }
    return nameKeyUpstreamArgsMap
  }, [])

  const clearNameKeyUpstreamArgsMap = useCallback(async () => {
    await localForage.setItem('nameKeyUpstreamArgsMap', {})
  }, [])

  // UpstreamMap forage
  const getForageUpstreamMap = useCallback(async () => {
    const currentUpstreamMap = await localForage.getItem<any>("upstreamMap")
    if (!currentUpstreamMap) {
      return {}
    }
    return currentUpstreamMap
  }, [])

  const setForageUpstreamMap = useCallback(async (upstreamMap: any) => {
    await localForage.setItem('upstreamMap', upstreamMap)
  }, [])

  const clearForageUpstreamMap = useCallback(async () => {
    await localForage.setItem('upstreamMap', {})
  }, [])

  const removeForageUpstreamMapById = useCallback(async (id: string) => {
    const currentUpstreamMap = await localForage.getItem<any>("upstreamMap")
    if (!currentUpstreamMap) {
      return
    }
    delete currentUpstreamMap[id]
    await localForage.setItem('upstreamMap', currentUpstreamMap)
  }, [])

  const value: IUpstreamMapContext = {
    clearForageUpstreamMap,
    clearNameKeyUpstreamArgsMap,
    getForageUpstreamMap,
    getNameKeyUpstreamArgsMap,
    removeForageUpstreamMapById,
    setForageUpstreamMap,
    setNameKeyUpstreamArgsMap,
  }

  return (
    <UpstreamMapContext.Provider value={value}>
      {children}
    </UpstreamMapContext.Provider>
  )
}

export default UpstreamMapProvider