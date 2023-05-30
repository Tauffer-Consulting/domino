import React, { useState, useCallback, useEffect } from 'react';
import DominoFormItem from './domino-form-item.component';


type initialDataType = Record<string, any>;

interface DominoFormProps {
    formId: string;
    schema: any;
    initialData: initialDataType;
    onChange: ({ errors, data }: { errors?: any, data: any }) => void;
}

const DominoForm: React.FC<DominoFormProps> = ({ formId, schema, initialData, onChange }) => {
    const [formData, setFormData] = useState(initialData);

    const handleChange = (key: string) => (value: any) => {
        setFormData(prevData => ({ ...prevData, [key]: value }));
    };

    const submitFormToParent = useEffect(() => {
        onChange({ data: formData });
    }, [formData, onChange]);

    useEffect(() => {
        setFormData(initialData)
    }, [initialData])

    return (
        <form>
            {Object.keys(schema.properties).map(key => (
                <div key={key}>
                    <DominoFormItem
                        formId={formId}
                        schema={schema}
                        itemKey={key}
                        value={formData[key]}
                        onChange={handleChange(key)}
                    />
                </div>
            ))}
        </form>
    );
};

export default React.memo(DominoForm);
