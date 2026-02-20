import { FormField } from '../util/helper';
interface CanvasProps {
    fields: FormField[];
    onSelectField: (id: string) => void;
    selectedId: string | null;
    onDeleteField: (id: string) => void;
}
export declare const Canvas: ({ fields, onSelectField, selectedId: _selectedId, onDeleteField: _onDeleteField }: CanvasProps) => import("react/jsx-runtime").JSX.Element;
export {};
