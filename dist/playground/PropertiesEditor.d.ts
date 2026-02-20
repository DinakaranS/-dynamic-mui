import { FormField } from '../util/helper';
interface PropertiesEditorProps {
    field: FormField | null;
    onUpdate: (field: FormField) => void;
    onDelete: (id: string) => void;
    allFields?: FormField[];
    onAllFieldsChange?: (fields: FormField[]) => void;
}
export declare const PropertiesEditor: ({ field, onUpdate, onDelete, allFields, onAllFieldsChange }: PropertiesEditorProps) => import("react/jsx-runtime").JSX.Element;
export {};
