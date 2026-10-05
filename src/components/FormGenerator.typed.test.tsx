import { createRef } from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { FormGenerator, FormData, useForm, FormApi, ClearFormData } from './FormGenerator';

afterEach(() => ClearFormData());

interface SignupValues {
    email: string;
    age: number;
}

const schema = [
    { type: 'textfield', props: { id: 'email', MuiAttributes: { label: 'Email' } }, layout: { row: 1, xs: 12 } },
    { type: 'numberfield', props: { id: 'age', MuiAttributes: { label: 'Age' } }, layout: { row: 2, xs: 12 } },
];

describe('typed values (generic FormApi / FormData / useForm)', () => {
    it('getValues() is typed by FormApi<T> and returns the values', () => {
        const api = createRef<FormApi<SignupValues>>();
        render(<FormGenerator guid="typed-1" data={schema as any} apiRef={api} patch={{ email: 'a@b.com', age: 20 }} />);

        // Typed access — `.email` / `.age` autocomplete (compile-time check).
        const values = api.current!.getValues();
        expect(values.email).toBe('a@b.com');
        expect(values.age).toBe(20);

        // setValues accepts Partial<SignupValues>.
        api.current!.setValues({ age: 21 });
        expect(api.current!.getValues().age).toBe(21);
    });

    it('FormData<T>(guid) and useForm<T>(guid) are generic', () => {
        render(<FormGenerator guid="typed-2" data={schema as any} patch={{ email: 'x@y.com', age: 30 }} />);

        const data = FormData<SignupValues>('typed-2');
        expect(data.email).toBe('x@y.com');

        const form = useForm<SignupValues>('typed-2');
        expect(form.getValues().age).toBe(30);
    });
});
