import { Box, Grid, CircularProgress } from '@mui/material';
import ReactMarkdown from 'react-markdown';


interface ITaskResultProps {
    base64_content: string
    file_type: string
}

export const TaskResult = (props: ITaskResultProps) => {
    const { base64_content, file_type } = props

    const renderContent = () => {
        if (!base64_content || !file_type) {
            return <CircularProgress />;
        }
        switch (file_type) {
            case 'txt':
                return <pre>{window.atob(base64_content)}</pre>;
            case 'json':
                return (
                    <pre
                        style={{
                            maxHeight: '100%',
                            overflowY: 'auto',
                            whiteSpace: 'pre-wrap',
                            wordWrap: 'break-word',
                        }}
                    >
                        {JSON.stringify(JSON.parse(window.atob(base64_content)), null, 2)}
                    </pre>
                );
            case 'jpeg':
            case 'png':
            case 'bmp':
            case 'gif':
            case 'tiff':
                return <img
                    src={`data:image/${file_type};base64,${base64_content}`}
                    alt="Content"
                    style={{ maxWidth: '100%', maxHeight: '100%' }}
                />;
            case 'svg':
                return (
                    <object type="image/svg+xml" data={`data:image/svg+xml;base64,${base64_content}`}>
                        Your browser does not support SVG
                    </object>
                );
            case 'md':
                return <ReactMarkdown>{window.atob(base64_content)}</ReactMarkdown>;
            default:
                return <div>Unsupported file type</div>;
        }
    };

    return (
        <Grid container mt={5}>
            <Grid item xs={12}>
                <Box width={1}>{renderContent()}</Box>
            </Grid>
        </Grid>
    )
}
