import {
    Grid,
} from '@mui/material';


interface ITaskResultProps {
    base64_content: string
    file_type: string
}

export const TaskResult = (props: ITaskResultProps) => {
    const { base64_content, file_type } = props


    return (
        <Grid container mt={5}>
            <Grid item xs={12}>
                <div>base64_content</div>
                <div>{base64_content}</div>
                <div>file_type</div>
                <div>{file_type}</div>
            </Grid>
        </Grid>
    )
}
