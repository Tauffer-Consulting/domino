import { useCallback, useRef, useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { Button, Card, Grid, ButtonGroup, CardContent } from '@mui/material';
import ReactFlow, {
    Background,
    Controls,
    ReactFlowProvider,
} from 'reactflow'
import 'reactflow/dist/style.css';

import { useWorkflows } from 'context/workflows/workflows.context';
import CustomNode from '../../workflows-editor/components/custom-node.component'; // todo move to shared
import { taskStatesColorMap } from '../../../../../constants';
import { TaskDetails } from './workflow-task-details.component';
import { TaskLogs } from './workflow-task-logs.component';
import { TaskResult } from './workflow-task-result.component';


const nodeTypes = {
    CustomNode: CustomNode
}

const buttonSX = {
    width: '100%',
    margin: '4px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: "#ebebeb",
    "&:hover": {
        border: "none",
        borderRadius: "8px",
        backgroundColor: '#ffffff'
    },
};

const buttonSXActive = {
    width: '100%',
    margin: '4px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: "#ffffff",
    "&:hover": {
        border: "none",
        borderRadius: "8px",
        backgroundColor: '#ffffff'
    },
};


export const WorflowRunTaskFlowchart = () => {
    const reactFlowWrapper = useRef(null)
    const [nodes, setNodes] = useState<any[]>([])
    const [edges, setEdges] = useState<any[]>([])
    const [nodeIdTaskMapping, setNodeIdTaskMapping] = useState<any>({})
    const [selectedButton, setSelectedButton] = useState<string>("details")
    const [selectedNodeTaskData, setSelectedNodeTaskData] = useState<any>(null)
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
    const [logs, setLogs] = useState<any>([])
    const [taskResult, setTaskResult] = useState<any>({
        base64_content: "",
        file_type: "",
    })
    const updateTime = 5000 // in ms

    const {
        selectedWorkflow,
        handleFetchWorkflowRunTasks,
        selectedWorkflowRunId,
        workflowRuns,
        handleFetchWorkflowRunTaskLogs,
        handleFetchWorkflowRunTaskResult,
    } = useWorkflows()

    const fetchTasks = useCallback(async () => {
        const firstPage = 0
        const pageSize = 100
        const response = await handleFetchWorkflowRunTasks(firstPage, pageSize)
        const { metadata } = response
        const total = metadata?.total ? metadata.total : 0

        const allTasks = [response]
        if (total > pageSize) {
            // TODO fetch all pages using promise.all
            // Create array of offsets to fetch
            const numberOfPages = Math.ceil(total / pageSize)
            const pages = Array.from(Array(numberOfPages).keys()).slice(1)
            const promises = pages.map((page) => handleFetchWorkflowRunTasks(page, pageSize))
            const responses = await Promise.all(promises)
            allTasks.push(...responses)
        }

        var nodes = []
        const nodeIdTaskMap: any = {}
        for (const response of allTasks) {
            const { data } = response
            // Create nodes and edges
            const responseNodesData = Array.isArray(data) ? data.map((task) => {
                var node: any = selectedWorkflow?.ui_schema?.nodes?.[task.task_id]
                nodeIdTaskMap[node.id] = {
                    ...task,
                    operatorName: node?.data?.style?.label ?? node?.data?.name,
                }

                const color = task.state in taskStatesColorMap ? taskStatesColorMap[task.state] : taskStatesColorMap['default']
                node.data.style.nodeStyle.backgroundColor = color

                node.data = {
                    ...node.data,
                }
                return node
            }) : []
            nodes.push(...responseNodesData)
        }
        setNodes(nodes)
        setNodeIdTaskMapping(nodeIdTaskMap)
        setEdges(selectedWorkflow?.ui_schema?.edges || [])

        return nodeIdTaskMap
    }, [handleFetchWorkflowRunTasks, setNodes, setEdges, selectedWorkflow])

    useEffect(() => {
        if (selectedWorkflowRunId) {
            fetchTasks()
            const interval = setInterval(() => {
                const workflowRun = workflowRuns?.data?.find((run) => run.workflow_run_id === selectedWorkflowRunId)
                // Fetch all tasks data
                fetchTasks().then((updatedNodeIdTaskMap) => {
                    // Fetch logs for the selected task 
                    if (selectedNodeId !== null) {
                        // Update details task data
                        const taskData = updatedNodeIdTaskMap[selectedNodeId]
                        setSelectedNodeTaskData(taskData)
                        const taskId = taskData?.task_id
                        const taskTryNumber = taskData?.try_number
                        // Update logs for the selected task
                        handleFetchWorkflowRunTaskLogs(taskId, taskTryNumber).then((response) => {
                            setLogs(response.data)
                        }).catch((error) => {
                            console.log('Error fetching logs', error)
                        })
                        // Update result for the selected task
                        handleFetchWorkflowRunTaskResult(taskId, taskTryNumber).then((response) => {
                            setTaskResult(response.data)
                        }).catch((error) => {
                            console.log('Error fetching logs', error)
                        })
                    }
                    // Check if the run is finished to avoid fetching tasks after the run is finished
                    if ((workflowRun?.state === 'success') || (workflowRun?.state === 'failed')) {
                        clearInterval(interval);
                    }
                }).catch((error) => {
                    console.log('Error fetching tasks', error)
                })
            }, updateTime); // Update every X seconds
            return () => clearInterval(interval);
        }
    }, [fetchTasks, selectedWorkflowRunId, workflowRuns, handleFetchWorkflowRunTaskLogs, handleFetchWorkflowRunTaskResult, selectedNodeId])


    const onNodeDoubleClick = useCallback(async (event: any, node: any) => {
        // TODO open the task details
        const taskData = nodeIdTaskMapping[node.id]
        setSelectedNodeTaskData(taskData)
        setSelectedNodeId(node.id)

        const updatedNodes = nodes.map((n) => {
            if (n.id === node.id) {
                n.data.style.nodeStyle.border = "3px solid #110d0e"
                n.data.style.nodeStyle.borderRadius = '3px'
            } else {
                n.data.style.nodeStyle.border = "none"
            }
            n.data = {
                ...n.data
            }
            return n
        })
        setNodes(updatedNodes)
        // Fetch logs for the task and display them
        const taskTryNumber = taskData?.try_number
        const taskId = taskData?.task_id
        handleFetchWorkflowRunTaskLogs(taskId, taskTryNumber).then((response) => {
            setLogs(response.data)
        }).catch((error) => {
            console.log('Error fetching logs', error)
            toast.error("Failed to fetch task logs")
        })

    }, [nodeIdTaskMapping, nodes, handleFetchWorkflowRunTaskLogs])


    const handleButtonClick = useCallback((event: any) => {
        setSelectedButton(event.target.value)
    }, [])

    return (
        <ReactFlowProvider>
            <Grid container spacing={2}>
                <Grid item xl={6} lg={6}>
                    <Card variant='elevation' sx={{ height: 'fit-content', mt: 2, overflow: 'hidden' }}>
                        <div
                            className='reactflow-wrapper'
                            ref={reactFlowWrapper}
                            style={{ height: 700 }}
                        >
                            <ReactFlow
                                nodes={nodes}
                                edges={edges}
                                nodeTypes={nodeTypes}
                                nodesConnectable={false}
                                onNodeDoubleClick={onNodeDoubleClick}
                            >
                                <Controls />
                                <Background color='#aaa' gap={16} />
                            </ReactFlow>
                        </div>
                    </Card>
                </Grid>
                <Grid item lg={6} sm={12}>
                    <Card variant='elevation' sx={{ height: 700, mt: 2, overflow: 'hidden', padding: '10px' }}>
                        <CardContent>
                            <Grid container sx={{ marginTop: '0px' }}>
                                <Grid item xs={12}>
                                    <ButtonGroup sx={{ width: '100%', background: "#ebebeb", height: "36px" }}>
                                        <Button
                                            value='details'
                                            sx={selectedButton === "details" ? buttonSXActive : buttonSX}
                                            onClick={handleButtonClick}
                                            style={{
                                                borderTopRightRadius: '8px',
                                                borderBottomRightRadius: '8px',
                                            }}
                                        >
                                            Details
                                        </Button>
                                        <Button
                                            value='logs'
                                            sx={selectedButton === "logs" ? buttonSXActive : buttonSX}
                                            onClick={handleButtonClick}
                                            style={{
                                                borderTopLeftRadius: '8px',
                                                borderBottomLeftRadius: '8px',
                                                borderTopRightRadius: '8px',
                                                borderBottomRightRadius: '8px',
                                            }}
                                        >
                                            Logs
                                        </Button>
                                        <Button
                                            value='result'
                                            sx={selectedButton === "result" ? buttonSXActive : buttonSX}
                                            onClick={handleButtonClick}
                                            style={{
                                                borderTopRightRadius: '8px',
                                                borderBottomRightRadius: '8px',
                                                borderTopLeftRadius: '8px',
                                                borderBottomLeftRadius: '8px',
                                            }}
                                        >
                                            Result
                                        </Button>
                                    </ButtonGroup>
                                </Grid>
                                <Grid item xs={12}>
                                    {
                                        selectedNodeTaskData === null ? "" : selectedButton === 'details' ? (
                                            <TaskDetails taskData={selectedNodeTaskData} />
                                        ) : selectedButton === 'logs' ? (
                                            <TaskLogs logs={logs} />
                                        ) : selectedButton === 'result' ? (
                                            <TaskResult content={""} content_type={""} />
                                        ) : ""
                                    }
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </ReactFlowProvider>
    )
}