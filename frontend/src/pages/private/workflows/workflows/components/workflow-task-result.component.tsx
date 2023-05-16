import {
    Grid,
} from '@mui/material';


interface ITaskResultProps {
    content: string
    content_type: string
}

export const TaskResult = (props: ITaskResultProps) => {
    const { content, content_type } = props


    return (
        <Grid container mt={5}>
            <Grid item xs={12}>
                <div>Display result</div>
            </Grid>
        </Grid>
    )
}
