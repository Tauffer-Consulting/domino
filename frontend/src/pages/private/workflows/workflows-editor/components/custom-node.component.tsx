import { memo } from 'react'
import { Handle, Position } from 'reactflow'

interface IStyleData {
  iconClassName: string
  iconStyle: object
  label: string
  module: string
  nodeStyle: object
  nodeType: "default" | "input" | "output"
  useIcon: boolean
  iconId: string
}
/**
 * @todo improve dtypes 
 */
export interface INodeData {
  name: string
  style: IStyleData
  handleOriantation: "horizontal" | "vertical"
}


/**
 * @todo make it work
 */
const CustomNode = memo((data: any) => {
  const extendedData = data.data

  const dominoReactflowClassTypeMap: any = {
    "source": "input",
    "default": "default",
    "sink": "output"
  }
  var extendedClassExt = ""
  if (extendedData?.style.nodeType === undefined || !['default', 'source', 'sink'].includes(extendedData?.style.nodeType)) {
    extendedClassExt = 'default'
  } else {
    extendedClassExt = dominoReactflowClassTypeMap[extendedData?.style.nodeType]
  }
  const extendedClass = `react-flow__node-${extendedClassExt}`
  // Handle render definition
  const nodeTypeRenderHandleMap: any = {
    "input": {
      renderTargetHandle: false,
      renderSourceHandle: true
    },
    "output": {
      renderTargetHandle: true,
      renderSourceHandle: false
    },
    "default": {
      renderTargetHandle: true,
      renderSourceHandle: true
    }
  }

  var targetHandlePosition = Position.Top
  var sourceHandlePosition = Position.Bottom
  if (extendedData?.handleOriantation === 'horizontal') {
    targetHandlePosition = Position.Left
    sourceHandlePosition = Position.Right
  }

  // // Icon
  const useIcon = !!extendedData?.style?.useIcon
  const iconId = useIcon && extendedData?.style?.hasOwnProperty('iconId') ? extendedData?.style?.iconId : ''
  const iconClass =
    useIcon && extendedData?.style?.hasOwnProperty('iconClassName')
      ?
      extendedData.style.iconClassName
      : 'fas fa-eye'
  const iconStyle =
    // @ts-ignore: Unreachable code error
    useIcon && extendedData?.style?.hasOwnProperty('iconStyle') ? extendedData.style.iconStyle : {}

  // // Style
  var customStyle: any = {
    display: 'flex',
    flexDirection: 'row-reverse',
    justifyContent: useIcon ? 'left' : 'center',
    alignItems: 'center'
  }
  if (extendedData?.style.hasOwnProperty('nodeStyle')) {
    customStyle = Object.assign(customStyle, extendedData.style.nodeStyle)
  }

  return (
    <div className={extendedClass} style={customStyle}>
      {
        nodeTypeRenderHandleMap[extendedClassExt]['renderSourceHandle'] ? (
          <Handle
            type='source'
            id={`$handle-source-${data['id']}`}
            position={sourceHandlePosition}
            style={{ width: "8px", height: "8px", border: '1px solid black', backgroundColor: 'white' }}
          />
        ) : ""
      }
      <div id={data['id']} style={{ fontWeight: 500 }}>
        {
          extendedData?.style?.label ? extendedData?.style?.label : extendedData?.name
        }
      </div>
      {
        useIcon ? (
          <div style={{ marginRight: '10px' }}>
            <span id={iconId} style={iconStyle}>
              <i className={iconClass} />
            </span>
          </div>
        ) : (
          ''
        )
      }
      {
        nodeTypeRenderHandleMap[extendedClassExt]['renderTargetHandle'] ? (
          <Handle
            type='target'
            id={`$handle-target-${data['id']}`}
            position={targetHandlePosition}
            style={{ width: "8px", height: "8px", borderRadius: '0px', border: '1px solid black', backgroundColor: 'white' }}
          />
        ) : ""
      }

    </div>
  )
})

export default CustomNode
