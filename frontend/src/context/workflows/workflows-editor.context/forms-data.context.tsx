import { workflowFormName } from '../../../constants';
import React, { useCallback } from 'react';
import localForage from 'services/config/local-forage.config';

import { createCustomContext } from 'utils';

export interface IFormsDataContext {
  setForageCheckboxStates: (checkboxStatesMap: any) => Promise<void> // TODO add type
  getForageCheckboxStates: () => Promise<any> // TODO add type

  fetchForageDataById: (id: string) => Promise<any> // TODO add type
  fetchFormsForageData: () => Promise<any> // TODO add type
  setFormsForageData: (id: string, data: any) => Promise<void>
  removeFormsForageDataById: (id: string) => Promise<void>
  removeFormsForageDataNotInIds: (ids: string[]) => Promise<void>
  clearForageFormsData: ()=> Promise<void>
  clearForageCheckboxStates: ()=> Promise<void>
}

export const [FormsDataContext, useFormsData] =
  createCustomContext<IFormsDataContext>('FormsData Context')

const FormsDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  // Forage forms data
  const fetchForageDataById = useCallback(async (id: string) => {
    const data = await localForage.getItem<any>('formsData')
    if (data === null) {
      return {}
    }
    return data[id]
  }, [])

  const setFormsForageData = useCallback(async (id: string, data: any) => {
    var currentData = await localForage.getItem<any>('formsData')
    if (!currentData) {
      currentData = {}
    }
    currentData[id] = data
    await localForage.setItem('formsData', currentData)
  }, [])

  const fetchFormsForageData = useCallback(async () => {
    const data = await localForage.getItem<any>('formsData')
    if (data === null) {
      return {}
    }
    return data
  }, [])

  const removeFormsForageDataById = useCallback(async (id: string) => {
    var currentData = await localForage.getItem<any>('formsData')
    if (!currentData) {
      return
    }
    delete currentData[id]
    await localForage.setItem('formsData', currentData)
  }, [])

  const removeFormsForageDataNotInIds = useCallback(async (ids: string[]) => {
    // Remove from forage "data" key the data that have keys different from the defined ids list
    var currentData = await localForage.getItem<any>('formsData')
    if (!currentData) {
      return
    }
    Object.entries(currentData).forEach(([nodeId, formData], index) => {
      if (!ids.includes(nodeId) && nodeId !== workflowFormName) {
        delete currentData[nodeId]
      }
    });
    localForage.setItem('formsData', currentData);
  }, [])

  const setForageCheckboxStates = useCallback(async (checkboxStatesMap: any) => {
    await localForage.setItem('checkboxStates', checkboxStatesMap)
  }, [])

  const getForageCheckboxStates = useCallback(async () => {
    const checkboxStates = await localForage.getItem('checkboxStates')
    if (!checkboxStates) {
      return {}
    }
    return checkboxStates
  }, [])

  const clearForageCheckboxStates = useCallback(async () => {
    await localForage.setItem('checkboxStates', {})
  }, [])

  const clearForageFormsData = useCallback(async()=>{
    await localForage.setItem('formsData', {})
  },[])


  const value = {
    fetchFormsForageData,
    fetchForageDataById,
    removeFormsForageDataById,
    removeFormsForageDataNotInIds,
    setFormsForageData,
    setForageCheckboxStates,
    clearForageFormsData,
    getForageCheckboxStates,
    clearForageCheckboxStates,
  }

  return (
    <FormsDataContext.Provider value={value}>
      {children}
    </FormsDataContext.Provider>
  );
}

export default FormsDataProvider;