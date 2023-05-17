import { Grid } from '@mui/material';
import ReactMarkdown from 'react-markdown';


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
            case 'bmp':
            case 'gif':
            case 'tiff':
                return <img src={`data:image/${file_type};base64,${base64_content}`} alt="Content" />;
            case 'svg':
                return (
                    <object type="image/svg+xml" data={`data:image/svg+xml;base64,${base64_content}`}>
                        Your browser does not support SVG
                    </object>
                );
            case 'markdown':
                return <ReactMarkdown>{window.atob(base64_content)}</ReactMarkdown>;
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
