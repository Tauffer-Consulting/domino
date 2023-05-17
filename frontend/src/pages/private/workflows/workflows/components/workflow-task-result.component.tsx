import {
    Grid,
} from '@mui/material';


interface ITaskResultProps {
    base64_content: string
    file_type: string
}

export const TaskResult = (props: ITaskResultProps) => {
    const { base64_content, file_type } = props

    const renderContent = () => {
        switch (file_type) {
            case 'txt':
                return <pre>{window.atob(base64_content)}</pre>;
            case 'jpeg':
            case 'png':
                return <img src={`data:image/${file_type};base64,${base64_content}`} alt="Content" />;
            default:
                return <div>Unsupported file type</div>;
        }
    };

    return (
        <Grid container mt={5}>
            <Grid item xs={12}>
                {renderContent()}
            </Grid>
        </Grid>
    )
}
