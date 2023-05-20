import React, { useState, useCallback, useEffect } from 'react';
import DominoFormItem from './domino-form-item.component';


type initialDataType = Record<string, any>;

interface DominoFormProps {
    schema: any;
    initialData: initialDataType;
    onChange: ({ errors, data }: { errors?: any, data: any }) => void;
}

const DominoForm: React.FC<DominoFormProps> = ({ schema, initialData, onChange }) => {
    const [formData, setFormData] = useState(initialData);

    const handleChange = (key: string) => (value: any) => {
        setFormData(prevData => ({ ...prevData, [key]: value }));
    };

    const submitFormToParent = useEffect(() => {
        onChange({ data: formData });
    }, [formData]);

    return (
        <form>
            {Object.keys(schema.properties).map(key => (
                <div key={key}>
                    <DominoFormItem
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
