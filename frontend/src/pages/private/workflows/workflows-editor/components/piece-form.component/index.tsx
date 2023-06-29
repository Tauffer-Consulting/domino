import React, { useState, useEffect } from 'react';
import PieceFormItem from '../piece-form-item.component';


type initialDataType = Record<string, any>;

interface PieceFormProps {
    formId: string;
    schema: any;
    initialData: initialDataType;
    onChange: ({ errors, data }: { errors?: any, data: any }) => void;
}

const PieceForm: React.FC<PieceFormProps> = ({ formId, schema, initialData, onChange }) => {
    const [formData, setFormData] = useState(initialData);

    const handleChange = (key: string) => (value: any) => {
        setFormData(prevData => ({ ...prevData, [key]: value }));
        // setNodePieceSchema()
    };

    useEffect(() => {
        onChange({ data: formData });
    }, [formData, onChange]);

    useEffect(() => {
        setFormData(initialData)
    }, [initialData])


    if (!schema.properties) return null;
    return (
        <form>
            {
                Object.keys(schema.properties).map(key => (
                    <div key={key}>
                        <PieceFormItem
                            formId={formId}
                            schema={schema}
                            itemKey={key}
                            value={formData[key]}
                            onChange={handleChange(key)}
                        />
                    </div>
                ))
            }
        </form>
    );
};

export default React.memo(PieceForm);
