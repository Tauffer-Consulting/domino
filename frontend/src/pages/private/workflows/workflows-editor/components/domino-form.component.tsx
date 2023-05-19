import React, { useState } from 'react';
import DominoFormItem from './domino-form-item.component';

interface DominoFormProps {
    schema: any;
    initialData: any;
}

const DominoForm: React.FC<DominoFormProps> = ({ schema, initialData }) => {
    const [formData, setFormData] = useState(initialData);

    const handleChange = (key: string) => (value: any) => {
        console.log('handleChange', key, value);
        // setFormData(prevData => ({ ...prevData, [key]: value }));
    };

    // console.log('schema', schema);

    return (
        <form>
            {Object.keys(schema.properties).map(key => (
                <div key={key}>
                    <DominoFormItem
                        schema={schema.properties[key]}
                        key={key}
                        value={formData[key]}
                        onChange={handleChange(key)}
                    />
                </div>
            ))}
        </form>
    );
};

export default DominoForm;
