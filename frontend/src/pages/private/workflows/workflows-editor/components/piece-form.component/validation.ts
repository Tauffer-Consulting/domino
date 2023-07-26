import * as yup from "yup"

export const inputsSchema = yup.lazy((value) => {

  if (Object.keys(value).length) {
    const valueValidation = yup.lazy(value => {
      switch (typeof value) {
        case 'string':
          return yup.string().required();
        case 'number':
          return yup.number().required();
        default:
          return yup.mixed(); // decide what is the default
      }
    })

    const defaultValidation = {
      fromUpstream: yup.boolean(), //? allowed | never | always
      upstreamArgument: yup.string().nullable(),
      upstreamId: yup.string().nullable(),
      value: valueValidation
    }

    const validationObject = {
      fromUpstream: yup.lazy(obj=>{
        return yup.object().shape(Object.keys(obj).reduce((acc,val)=>({
          ...acc,
          [val]: yup.boolean().required()
        }),{}))
      }),
      upstreamArgument: yup.lazy(obj=>{
        return yup.object().shape(Object.keys(obj).reduce((acc,val)=>({
          ...acc,
          [val]: yup.string().nullable()
        }),{}))
      }),
      upstreamId: yup.lazy(obj=>{
        return yup.object().shape(Object.keys(obj).reduce((acc,val)=>({
          ...acc,
          [val]: yup.string().nullable()
        }),{}))
      }),
      value: yup.lazy(obj=>{
        return yup.object().shape(Object.keys(obj).reduce((acc,val)=>({
          ...acc,
          [val]: valueValidation
        }),{}))
      })
    }

    const validationArray = {
      fromUpstream: yup.boolean(), //? allowed | never | always
      upstreamArgument: yup.string().nullable(),
      upstreamId: yup.string().nullable(),
      value: yup.array().of(yup.lazy(item=>{
        if(typeof item.value==="object"){
          return yup.object(validationObject)
        }
        return yup.object(defaultValidation)
      }))
    }

    const newEntries = Object.keys(value).reduce(
      (acc, val) => {
        if (Array.isArray(value[val].value)) {
          return {
            ...acc,
            [val]: yup.object(validationArray)
          }
        } else {
          return {
            ...acc,
            [val]: yup.object(defaultValidation),
          }
        }
      },
      {}
    )

    return yup.object().shape(newEntries)
  }
  return yup.mixed().notRequired()
})
