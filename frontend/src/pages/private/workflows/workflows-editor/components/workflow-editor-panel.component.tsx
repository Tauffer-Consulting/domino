import { useCallback, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import ReactFlow, {
  addEdge,
  Background,
  Controls,
  ReactFlowProvider,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  Connection,
  Edge,
  //removeElements,
  Node
} from 'reactflow'
import { extractDefaultValues } from 'utils'
import CustomNode from './custom-node.component'
import SidebarForm from './sidebar-form.component'
import { useWorkflowsEditor } from "context/workflows/workflows-editor.context"
import { INodeData } from './custom-node.component'
import { containerResourcesSchema } from 'common/schemas/containerResourcesSchemas'
/**
 * @todo When change the workspace should we clear the forage ? 
 * @todo Solve any types
 */

// Load CustomNode
const nodeTypes = {
  CustomNode: CustomNode
}


// @ts-ignore: Unreachable code error
const getId = (module_name) => {
  return `${module_name}_${uuidv4()}`
}

const WorkflowEditorPanelComponent = () => {
  const [formSchema, setFormSchema] = useState<any>({})
  const [formId, setFormId] = useState<string>("")
  const [formTitle, setFormTitle] = useState<string>('')
  const [drawerState, setDrawerState] = useState(false)
  const [reactFlowInstance, setReactFlowInstance] = useState(null)
  const reactFlowWrapper = useRef(null)

  const {
    nodeDirection,
    edges,
    setEdges,
    nodes,
    setNodes,
    fetchForagePieceById,
    setFormsForageData,
    removeFormsForageDataById,
    fetchForageWorkflowNodes,
    fetchForageWorkflowEdges,
    getForageUpstreamMap,
    setForageUpstreamMap,
  } = useWorkflowsEditor()

  // Removing flowchart elements
  const onNodesDelete = useCallback(async (nodes: any) => {
    for (const node of nodes) {
      await removeFormsForageDataById(node.id)
    }
  }, [removeFormsForageDataById])


  // Node double click open drawer with forms
  const onNodeDoubleClick = useCallback(async (event: any, node: any) => {
    const operatorNode = await fetchForagePieceById(node.id.split('_')[0])

    setFormSchema(operatorNode?.input_schema)
    setFormId(node.id)
    setFormTitle(() => { return operatorNode?.name ? operatorNode?.name : "" })
    setDrawerState(true)
  }, [fetchForagePieceById])

  const onLoad = useCallback(async (_reactFlowInstance: any) => {
    setReactFlowInstance(_reactFlowInstance)
    // // Fetch old state from forage to avoid loosing flowchart when refreshing/leaving page
    const workflowNodes = await fetchForageWorkflowNodes()
    const workflowEdges = await fetchForageWorkflowEdges()

    if (workflowNodes.length > 0) {
      setNodes(workflowNodes)
    }
    if (workflowEdges.length > 0) {
      setEdges(workflowEdges)
    }

  }, [setNodes, setEdges, fetchForageWorkflowNodes, fetchForageWorkflowEdges])

  // Drag and Drop functions
  // @ts-ignore: Unreachable code error
  const onDragOver = (event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }

  const onDrop = useCallback(async (event: any) => {
    event.preventDefault()

    // @ts-ignore: Unreachable code error
    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect()
    const nodeData = event.dataTransfer.getData('application/reactflow')
    // @ts-ignore: Unreachable code error
    const position = reactFlowInstance.project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top
    })

    var { ...data } = JSON.parse(nodeData)

    const newNodeData: INodeData = {
      name: data.name,
      style: data.style,
      handleOriantation: nodeDirection,
    }

    const newNode = {
      id: getId(data['id']),
      type: 'CustomNode',
      position,
      data: newNodeData
    }

    setNodes((ns: Node[]) => ns.concat(newNode))
    const operator = await fetchForagePieceById(data.id)
    const inputSchema = operator?.input_schema
    const defaultData: any = extractDefaultValues(inputSchema)
    const containerResourcesDefaultData: unknown = extractDefaultValues(containerResourcesSchema)

    // Set default data for upstream mapping - used in dags
    var upstreamMap = await getForageUpstreamMap()
    var upstreamMapFormInfo: any = {}
    for (const key in defaultData) {
      const fromUpstream = false // TODO - If someday we allow default upstream true we should change this
      const upstreamId = null
      upstreamMapFormInfo[key] = {
        fromUpstream,
        upstreamId,
        upstreamArgument: null,
        value: (defaultData[key] === null || defaultData[key] === undefined) ? null : defaultData[key]
      }
    }
    upstreamMap[newNode.id] = upstreamMapFormInfo
    await setForageUpstreamMap(upstreamMap)
    defaultData['storage'] = {
      "storageAccessMode": 'Read/Write',
    }
    defaultData['containerResources'] = containerResourcesDefaultData
    // Set default data for the node form - used in json-forms
    await setFormsForageData(newNode.id, defaultData)
  }, [fetchForagePieceById, nodeDirection, setFormsForageData, setForageUpstreamMap, getForageUpstreamMap, reactFlowInstance, setNodes])

  // Left drawer controls
  // @ts-ignore: Unreachable code error
  const toggleDrawer = (open) => (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return
    }
    setDrawerState(open)
  }

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds: Node[]) => applyNodeChanges(changes, nds))
  }, [setNodes]);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds: Edge[]) => applyEdgeChanges(changes, eds))
  }, [setEdges]);

  // Connecting elements
  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds: Edge[]) => addEdge(connection, eds))
  }, [setEdges]);

  return (
    <ReactFlowProvider>
      <div
        className='reactflow-wrapper'
        ref={reactFlowWrapper}
        style={{ height: 600 }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onConnect={onConnect}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDoubleClick={onNodeDoubleClick}
          onNodesDelete={onNodesDelete}
          deleteKeyCode={["Delete", "Backspace"]} /* 'delete'-key */
          onInit={onLoad}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
        >
          <Controls />
          <Background color='#aaa' gap={16} />
        </ReactFlow>
      </div>
      <SidebarForm formSchema={formSchema} formId={formId} onClose={toggleDrawer(false)} open={drawerState} title={formTitle} />

    </ReactFlowProvider>
  )
}

export default WorkflowEditorPanelComponent;
