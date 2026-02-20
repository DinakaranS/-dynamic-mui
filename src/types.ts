// Imports removed as they were unused

export interface ControlChangeProps {
    id?: string;
    value: any;
    option?: any;
}

export interface ControlProps {
    attributes?: {
        id?: string;
        value?: any;
        MuiAttributes?: any;
        InputProps?: any;
        options?: any[];
        format?: string;
        [key: string]: any;
    };
    rules?: any;
    patch?: Record<string, any>;
    onChange?: (args: ControlChangeProps) => void;
}
