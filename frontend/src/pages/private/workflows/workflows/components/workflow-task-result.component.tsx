import { Box, Grid, CircularProgress } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import { PDFViewer, Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';


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
                    <object
                        type="image/svg+xml" data={`data:image/svg+xml;base64,${base64_content}`}
                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                    >
                        Your browser does not support SVG
                    </object>
                );
            case 'md':
                return <ReactMarkdown>{window.atob(base64_content)}</ReactMarkdown>;
            case 'pdf':
                return (
                    <div style={{ width: '100%', height: '500px' }}>
                        PDF result display not yet implemented
                        {/* <PDFViewer>
                            <Document file={`data:application/pdf;base64,${base64_content}`}>
                                <Page pageNumber={1} />
                            </Document>
                        </PDFViewer> */}
                    </div>
                );
            case 'html':
                return (
                    <div style={{ width: '100%', height: '500px' }}>
                        HTML result display not yet implemented
                    </div>
                    // <iframe
                    //     src={`data:text/html;base64,${base64_content}`}
                    //     style={{ width: '100%', height: '100%' }}
                    // />
                );
            default:
                return <div>Unsupported file type</div>;
        }
    };

    return (
        <Box
            width={1}
            sx={{ height: "inherit" }}
        >
            {renderContent()}
        </Box>
    )
}
