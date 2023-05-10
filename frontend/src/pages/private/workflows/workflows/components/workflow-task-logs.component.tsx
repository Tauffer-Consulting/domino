import {
    Grid,
    TextareaAutosize,
    Switch,
    FormControlLabel,
    FormGroup,
} from '@mui/material';
import { useState, useEffect, useMemo } from 'react';


interface ITaskLogsProps {
    logs: string[]
}

export const TaskLogs = (props: ITaskLogsProps) => {
    // @todo use style components instead of inline styles
    const { logs } = props
    const [logContent, setLogContent] = useState<string>('')
    const [renderOverflowX, setRenderOverflowX] = useState<boolean>(true)

    // @todo
    // const logsTypeColorMap = {
    //     'INFO': '#64df46',
    //     'ERROR': '#f00',
    //     'WARNING': '#f90',
    //     'DEBUG': '#00f',
    // }

    useEffect(() => {
        setLogContent(logs.join('\n'))
    }, [logs])

    const textareaStyle: any = useMemo(()=> {
        return {
            width: '100%',
            border: 'none',
            overflowX: renderOverflowX ? 'scroll' : 'hidden',
            whiteSpace: renderOverflowX ? 'pre' : 'pre-wrap',
            outline: "none",
        }
    }, [renderOverflowX])


    return (
        <Grid container mt={5}>
            <Grid item xs={12}>
                <FormGroup sx={{marginBottom: '8px'}}>
                    <FormControlLabel 
                        control={<Switch defaultChecked onChange={() => setRenderOverflowX(!renderOverflowX)} />} 
                        label="Wrap text horizontally." 
                    />
                </FormGroup>
                <TextareaAutosize 
                    defaultValue={logContent} 
                    style={textareaStyle}
                    minRows={25}
                    maxRows={35}
                />
            </Grid>
        </Grid>
    )
}
