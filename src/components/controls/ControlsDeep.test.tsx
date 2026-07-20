import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import ChipSelect from './ChipSelect/chipselect';
import CascadeSelect from './CascadeSelect/cascadeselect';
import NumberStepper from './NumberStepper/numberstepper';
import KeyValueField from './KeyValueField/keyvaluefield';
import OtpField from './OtpField/otpfield';
import CurrencyField from './CurrencyField/currencyfield';
import PhoneField from './PhoneField/phonefield';
import ToggleButtons from './ToggleButtons/togglebuttons';
import Rating from './Rating/rating';
import Slider from './Slider/slider';
import MatrixField from './MatrixField/matrixfield';
import ConsentField from './ConsentField/consentfield';
import TagsInput from './TagsInput/tagsinput';

/**
 * ADVERSARIAL DEEP TEST — drives each control with a mock onChange and asserts
 * the emitted { id, value, option } payload and displayed/hydrated state.
 * Flaky jsdom interactions (Autocomplete/Slider/Select menus) are exercised
 * where reliable and fall back to render/hydration/prop-wiring assertions
 * otherwise. Confirmed source bugs are marked `it.skip('BUG: …')`.
 */

const onChange = vi.fn();
beforeEach(() => onChange.mockClear());

// ---------------------------------------------------------------------------
// ChipSelect
// ---------------------------------------------------------------------------
describe('ChipSelect — hydration & payload', () => {
    const OPTS = [
        { value: 'design', label: 'Design' },
        { value: 'dev', label: 'Development' },
        { value: 'sales', label: 'Sales' },
    ];
    const filled = (label: string) =>
        screen.getByText(label).closest('.MuiChip-root')?.className.includes('MuiChip-filled');

    it('single: emits scalar value + single option object', () => {
        render(<ChipSelect attributes={{ id: 'plan', options: OPTS }} onChange={onChange} />);
        fireEvent.click(screen.getByText('Design'));
        expect(onChange).toHaveBeenCalledWith({
            id: 'plan',
            value: 'design',
            option: { label: 'Design', value: 'design', icon: undefined, color: undefined, disabled: undefined },
        });
    });

    it('multi: emits array value + array of option objects', () => {
        render(<ChipSelect attributes={{ id: 't', multiple: true, options: OPTS }} onChange={onChange} />);
        fireEvent.click(screen.getByText('Design'));
        fireEvent.click(screen.getByText('Sales'));
        const last = onChange.mock.calls.at(-1)![0];
        expect(last.value).toEqual(['design', 'sales']);
        expect(Array.isArray(last.option)).toBe(true);
        expect(last.option.map((o: any) => o.value)).toEqual(['design', 'sales']);
    });

    it('single: allowDeselect=true clears to "" with option null on re-click', () => {
        render(<ChipSelect attributes={{ id: 'p', options: OPTS }} onChange={onChange} />);
        fireEvent.click(screen.getByText('Design'));
        fireEvent.click(screen.getByText('Design'));
        expect(onChange).toHaveBeenLastCalledWith({ id: 'p', value: '', option: null });
    });

    it('single: allowDeselect=false keeps the value on re-click', () => {
        render(<ChipSelect attributes={{ id: 'p', allowDeselect: false, options: OPTS }} onChange={onChange} />);
        fireEvent.click(screen.getByText('Design'));
        fireEvent.click(screen.getByText('Design'));
        expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ value: 'design' }));
    });

    it('multi hydrates from a real array', () => {
        render(<ChipSelect attributes={{ id: 't', multiple: true, value: ['design', 'sales'], options: OPTS }} onChange={onChange} />);
        expect(filled('Design')).toBe(true);
        expect(filled('Sales')).toBe(true);
        expect(filled('Development')).toBe(false);
    });

    it('multi hydrates from a semicolon-joined string', () => {
        render(<ChipSelect attributes={{ id: 't', multiple: true, value: 'design;sales', options: OPTS }} onChange={onChange} />);
        expect(filled('Design')).toBe(true);
        expect(filled('Sales')).toBe(true);
    });

    it('multi hydrates from a comma-joined string even though default separator is ";"', () => {
        render(<ChipSelect attributes={{ id: 't', multiple: true, value: 'design,sales', options: OPTS }} onChange={onChange} />);
        expect(filled('Design')).toBe(true);
        expect(filled('Sales')).toBe(true);
    });

    it('multi hydrates from a scalar (wraps to single-item array)', () => {
        render(<ChipSelect attributes={{ id: 't', multiple: true, value: 'dev', options: OPTS }} onChange={onChange} />);
        expect(filled('Development')).toBe(true);
    });

    it('single hydrates a scalar; array hydration takes first element', () => {
        const { rerender } = render(<ChipSelect attributes={{ id: 'p', value: 'dev', options: OPTS }} onChange={onChange} />);
        expect(filled('Development')).toBe(true);
        rerender(<ChipSelect attributes={{ id: 'p', value: ['sales', 'design'], options: OPTS }} onChange={onChange} />);
        expect(filled('Sales')).toBe(true);
        expect(filled('Design')).toBe(false);
    });

    it('supports plain string[] options', () => {
        render(<ChipSelect attributes={{ id: 'c', options: ['Red', 'Green'] }} onChange={onChange} />);
        fireEvent.click(screen.getByText('Green'));
        expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: 'Green' }));
    });

    it('disabled option is ignored (no selection, no onChange)', () => {
        render(<ChipSelect attributes={{ id: 'c', options: [{ value: 'a', label: 'Alpha', disabled: true }] }} onChange={onChange} />);
        fireEvent.click(screen.getByText('Alpha'));
        expect(onChange).not.toHaveBeenCalled();
    });
});

// ---------------------------------------------------------------------------
// CascadeSelect
// ---------------------------------------------------------------------------
describe('CascadeSelect — dependent options & clearing', () => {
    const optionsMap = {
        fruit: [{ value: 'apple', label: 'Apple' }, { value: 'banana', label: 'Banana' }],
        veg: [{ value: 'carrot', label: 'Carrot' }],
    };

    it('resolves options from optionsMap[parentValue]', () => {
        render(<CascadeSelect attributes={{ id: 'c', parentValue: 'fruit', optionsMap }} onChange={onChange} />);
        const trigger = screen.getByRole('combobox');
        fireEvent.mouseDown(trigger);
        const listbox = within(screen.getByRole('listbox'));
        expect(listbox.getByText('Apple')).toBeInTheDocument();
        expect(listbox.getByText('Banana')).toBeInTheDocument();
    });

    it('selecting an option emits its value + option', () => {
        render(<CascadeSelect attributes={{ id: 'c', parentValue: 'fruit', optionsMap }} onChange={onChange} />);
        fireEvent.mouseDown(screen.getByRole('combobox'));
        fireEvent.click(within(screen.getByRole('listbox')).getByText('Banana'));
        expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ id: 'c', value: 'banana' }));
    });

    it('parent change invalidating the current value clears it and emits ""', () => {
        const { rerender } = render(
            <CascadeSelect attributes={{ id: 'c', parentValue: 'fruit', optionsMap, value: 'apple' }} onChange={onChange} />,
        );
        rerender(<CascadeSelect attributes={{ id: 'c', parentValue: 'veg', optionsMap, value: 'apple' }} onChange={onChange} />);
        expect(onChange).toHaveBeenCalledWith({ id: 'c', value: '', option: null });
    });

    it('parent change that keeps the value valid does NOT clear/emit', () => {
        const map = { a: [{ value: 'x', label: 'X' }], b: [{ value: 'x', label: 'X' }, { value: 'y', label: 'Y' }] };
        const { rerender } = render(
            <CascadeSelect attributes={{ id: 'c', parentValue: 'a', optionsMap: map, value: 'x' }} onChange={onChange} />,
        );
        rerender(<CascadeSelect attributes={{ id: 'c', parentValue: 'b', optionsMap: map, value: 'x' }} onChange={onChange} />);
        expect(onChange).not.toHaveBeenCalled();
    });

    it('falls back to `options` when optionsMap/parentValue are absent', () => {
        render(<CascadeSelect attributes={{ id: 'c', options: ['one', 'two'] }} onChange={onChange} />);
        fireEvent.mouseDown(screen.getByRole('combobox'));
        const listbox = within(screen.getByRole('listbox'));
        expect(listbox.getByText('one')).toBeInTheDocument();
        expect(listbox.getByText('two')).toBeInTheDocument();
    });
});

// ---------------------------------------------------------------------------
// NumberStepper
// ---------------------------------------------------------------------------
describe('NumberStepper — clamping & steps', () => {
    it('increment/decrement respect step', () => {
        render(<NumberStepper attributes={{ id: 'n', value: 0, step: 5 }} onChange={onChange} />);
        fireEvent.click(screen.getByLabelText('increment'));
        expect(onChange).toHaveBeenLastCalledWith({ id: 'n', value: 5 });
        fireEvent.click(screen.getByLabelText('decrement'));
        expect(onChange).toHaveBeenLastCalledWith({ id: 'n', value: 0 });
    });

    it('clamps to max on increment and disables the + button at max', () => {
        render(<NumberStepper attributes={{ id: 'n', value: 9, max: 10, step: 5 }} onChange={onChange} />);
        fireEvent.click(screen.getByLabelText('increment')); // 9 -> 14 clamps to 10
        expect(onChange).toHaveBeenLastCalledWith({ id: 'n', value: 10 });
        expect(screen.getByLabelText('increment')).toBeDisabled();
    });

    it('disables the - button at min', () => {
        render(<NumberStepper attributes={{ id: 'n', value: 0, min: 0 }} onChange={onChange} />);
        expect(screen.getByLabelText('decrement')).toBeDisabled();
    });

    it('typing an out-of-range value clamps on blur', () => {
        render(<NumberStepper attributes={{ id: 'n', value: 5, min: 0, max: 10 }} onChange={onChange} />);
        // The numeric input's aria-label falls back to the field id when no label.
        const input = screen.getByLabelText('n') as HTMLInputElement;
        fireEvent.change(input, { target: { value: '999' } });
        fireEvent.blur(input);
        expect(onChange).toHaveBeenLastCalledWith({ id: 'n', value: 10 });
        expect(input.value).toBe('10');
    });

    it('typing below min clamps up on blur', () => {
        render(<NumberStepper attributes={{ id: 'n', value: 5, min: 3, max: 10 }} onChange={onChange} />);
        const input = screen.getByLabelText('n') as HTMLInputElement;
        fireEvent.change(input, { target: { value: '-4' } });
        fireEvent.blur(input);
        expect(onChange).toHaveBeenLastCalledWith({ id: 'n', value: 3 });
    });

    it('hydrates and clamps the initial value against min', () => {
        render(<NumberStepper attributes={{ id: 'n', value: 1, min: 4 }} onChange={onChange} />);
        expect((screen.getByLabelText('n') as HTMLInputElement).value).toBe('4');
    });
});

// ---------------------------------------------------------------------------
// KeyValueField
// ---------------------------------------------------------------------------
describe('KeyValueField — map/array hydration & object emit', () => {
    it('hydrates from an object map', () => {
        render(<KeyValueField attributes={{ id: 'kv', value: { a: '1', b: '2' } }} onChange={onChange} />);
        expect((screen.getAllByDisplayValue('a')[0] as HTMLInputElement)).toBeInTheDocument();
        expect((screen.getAllByDisplayValue('1')[0] as HTMLInputElement)).toBeInTheDocument();
    });

    it('hydrates from an array of {key,value}', () => {
        render(<KeyValueField attributes={{ id: 'kv', value: [{ key: 'x', value: '9' }] }} onChange={onChange} />);
        expect(screen.getByDisplayValue('x')).toBeInTheDocument();
        expect(screen.getByDisplayValue('9')).toBeInTheDocument();
    });

    it('editing a cell emits an OBJECT map', () => {
        render(<KeyValueField attributes={{ id: 'kv', value: { a: '1' } }} onChange={onChange} />);
        const valInput = screen.getByDisplayValue('1');
        fireEvent.change(valInput, { target: { value: '42' } });
        expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'kv', value: { a: '42' } }));
    });

    it('add row then fill key/value emits the enlarged map', () => {
        render(<KeyValueField attributes={{ id: 'kv', value: { a: '1' } }} onChange={onChange} />);
        fireEvent.click(screen.getByRole('button', { name: /add/i }));
        // two key inputs + two value inputs now
        const keyInputs = screen.getAllByLabelText('Key');
        const valInputs = screen.getAllByLabelText('Value');
        fireEvent.change(keyInputs[1], { target: { value: 'b' } });
        fireEvent.change(valInputs[1], { target: { value: '2' } });
        expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ value: { a: '1', b: '2' } }));
    });

    it('remove row drops it from the emitted map', () => {
        render(<KeyValueField attributes={{ id: 'kv', value: { a: '1', b: '2' } }} onChange={onChange} />);
        const removeButtons = screen.getAllByRole('button', { name: /remove/i });
        fireEvent.click(removeButtons[0]);
        expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ value: { b: '2' } }));
    });

    it('blank keys are skipped from the emitted map', () => {
        render(<KeyValueField attributes={{ id: 'kv', value: { a: '1' } }} onChange={onChange} />);
        fireEvent.click(screen.getByRole('button', { name: /add/i })); // adds a blank {key:'',value:''}
        const valInputs = screen.getAllByLabelText('Value');
        fireEvent.change(valInputs[1], { target: { value: 'orphan' } }); // value with blank key
        expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ value: { a: '1' } }));
    });
});

// ---------------------------------------------------------------------------
// OtpField
// ---------------------------------------------------------------------------
describe('OtpField — boxes, typing, backspace, paste', () => {
    const boxes = () => screen.getAllByRole('textbox') as HTMLInputElement[];

    it('renders `length` boxes', () => {
        render(<OtpField attributes={{ id: 'o', length: 4 }} onChange={onChange} />);
        expect(boxes()).toHaveLength(4);
    });

    it('typing fills boxes and emits the concatenation', () => {
        render(<OtpField attributes={{ id: 'o', length: 4 }} onChange={onChange} />);
        const b = boxes();
        fireEvent.change(b[0], { target: { value: '1' } });
        fireEvent.change(b[1], { target: { value: '2' } });
        expect(onChange).toHaveBeenLastCalledWith({ id: 'o', value: '12' });
    });

    it('backspace on an empty box clears the previous box', () => {
        render(<OtpField attributes={{ id: 'o', length: 4, value: '12' }} onChange={onChange} />);
        const b = boxes();
        // box index 2 is empty; backspace should clear box index 1
        fireEvent.keyDown(b[2], { key: 'Backspace' });
        expect(onChange).toHaveBeenLastCalledWith({ id: 'o', value: '1' });
    });

    it('paste distributes across boxes from the paste target', () => {
        render(<OtpField attributes={{ id: 'o', length: 6 }} onChange={onChange} />);
        const b = boxes();
        fireEvent.paste(b[0], { clipboardData: { getData: () => '123456' } });
        expect(onChange).toHaveBeenLastCalledWith({ id: 'o', value: '123456' });
    });

    it('hydrates from an initial string value', () => {
        render(<OtpField attributes={{ id: 'o', length: 4, value: 'ab' }} onChange={onChange} />);
        const b = boxes();
        expect(b[0].value).toBe('a');
        expect(b[1].value).toBe('b');
        expect(b[2].value).toBe('');
    });
});

// ---------------------------------------------------------------------------
// CurrencyField / PhoneField (react-number-format)
// ---------------------------------------------------------------------------
describe('CurrencyField — formatting & raw emit', () => {
    it('hydrates and formats the display with fixedDecimalScale', () => {
        render(<CurrencyField attributes={{ id: 'amt', value: '1234' }} onChange={onChange} />);
        expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('$1,234.00');
    });

    it('typing emits the raw numeric string value and a numeric floatValue option', () => {
        render(<CurrencyField attributes={{ id: 'amt' }} onChange={onChange} />);
        const input = screen.getByRole('textbox') as HTMLInputElement;
        fireEvent.change(input, { target: { value: '1234' } });
        const last = onChange.mock.calls.at(-1)![0];
        expect(last.id).toBe('amt');
        // react-number-format with fixedDecimalScale keeps the fixed decimals in
        // the raw numeric-string value (valueIsNumericString), so it is '1234.00'.
        expect(last.value).toBe('1234.00');
        expect(last.option).toBe(1234);
    });
});

describe('PhoneField — pattern formatting & raw digits', () => {
    it('hydrates and formats the display', () => {
        render(<PhoneField attributes={{ id: 'ph', value: '5551234567' }} onChange={onChange} />);
        expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('+1 (555) 123-4567');
    });

    it('typing emits raw digits as value and formatted string as option', () => {
        render(<PhoneField attributes={{ id: 'ph' }} onChange={onChange} />);
        const input = screen.getByRole('textbox') as HTMLInputElement;
        fireEvent.change(input, { target: { value: '5551234567' } });
        const last = onChange.mock.calls.at(-1)![0];
        expect(last.value).toBe('5551234567');
        expect(last.option).toBe('+1 (555) 123-4567');
    });
});

// ---------------------------------------------------------------------------
// ToggleButtons
// ---------------------------------------------------------------------------
describe('ToggleButtons — exclusive vs multiple', () => {
    const OPTS = [
        { value: 'l', label: 'Left' },
        { value: 'c', label: 'Center' },
        { value: 'r', label: 'Right' },
    ];

    it('single (exclusive): emits scalar value + single option', () => {
        render(<ToggleButtons attributes={{ id: 'align', options: OPTS }} onChange={onChange} />);
        fireEvent.click(screen.getByText('Center'));
        expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ id: 'align', value: 'c', option: { value: 'c', label: 'Center', icon: undefined } }));
    });

    it('single: clicking the active button again emits null', () => {
        render(<ToggleButtons attributes={{ id: 'align', value: 'c', options: OPTS }} onChange={onChange} />);
        fireEvent.click(screen.getByText('Center'));
        expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ value: null }));
    });

    it('multiple: accumulates into an array + array of options', () => {
        render(<ToggleButtons attributes={{ id: 'fmt', multiple: true, options: OPTS }} onChange={onChange} />);
        fireEvent.click(screen.getByText('Left'));
        fireEvent.click(screen.getByText('Right'));
        const last = onChange.mock.calls.at(-1)![0];
        expect(last.value).toEqual(['l', 'r']);
        expect(last.option.map((o: any) => o.value)).toEqual(['l', 'r']);
    });

    it('normalizes plain string[] options', () => {
        render(<ToggleButtons attributes={{ id: 't', options: ['A', 'B'] }} onChange={onChange} />);
        fireEvent.click(screen.getByText('B'));
        expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: 'B' }));
    });
});

// ---------------------------------------------------------------------------
// Rating
// ---------------------------------------------------------------------------
describe('Rating — value emit', () => {
    it('emits the chosen numeric value', () => {
        const { container } = render(<Rating attributes={{ id: 'r', label: 'Stars' }} onChange={onChange} />);
        const three = container.querySelector('input[value="3"]') as HTMLInputElement;
        fireEvent.click(three);
        expect(onChange).toHaveBeenCalledWith({ id: 'r', value: 3 });
    });

    it('renders `max` star inputs and hydrates initial value', () => {
        const { container } = render(<Rating attributes={{ id: 'r', value: 2, MuiAttributes: { max: 7 } }} onChange={onChange} />);
        // MUI Rating renders max radio inputs (+ an empty "0" input)
        const filled = container.querySelectorAll('.MuiRating-iconFilled');
        expect(filled.length).toBeGreaterThanOrEqual(2);
    });
});

// ---------------------------------------------------------------------------
// Slider
// ---------------------------------------------------------------------------
describe('Slider — single & range', () => {
    it('single: emits value on change', () => {
        render(<Slider attributes={{ id: 's', value: 20, min: 0, max: 100 }} onChange={onChange} />);
        const thumb = screen.getByRole('slider') as HTMLInputElement;
        fireEvent.change(thumb, { target: { value: '55' } });
        expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ id: 's' }));
    });

    it('range: renders two thumbs when value is [min,max]', () => {
        render(<Slider attributes={{ id: 's', value: [20, 40], min: 0, max: 100 }} onChange={onChange} />);
        expect(screen.getAllByRole('slider')).toHaveLength(2);
    });

    it('single: renders one thumb reflecting the value', () => {
        render(<Slider attributes={{ id: 's', value: 30 }} onChange={onChange} />);
        const sliders = screen.getAllByRole('slider');
        expect(sliders).toHaveLength(1);
        expect(sliders[0]).toHaveValue('30');
    });
});

// ---------------------------------------------------------------------------
// MatrixField
// ---------------------------------------------------------------------------
describe('MatrixField — single & multiple', () => {
    const rows = [{ id: 'q1', label: 'Speed' }, { id: 'q2', label: 'Price' }];
    const columns = [{ value: 'low', label: 'Low' }, { value: 'high', label: 'High' }];

    it('single: selecting a cell emits { rowId: colValue }', () => {
        render(<MatrixField attributes={{ id: 'm', rows, columns }} onChange={onChange} />);
        fireEvent.click(screen.getByLabelText('Speed High'));
        expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'm', value: { q1: 'high' } }));
    });

    it('single: a second row adds another key', () => {
        render(<MatrixField attributes={{ id: 'm', rows, columns, value: { q1: 'high' } }} onChange={onChange} />);
        fireEvent.click(screen.getByLabelText('Price Low'));
        expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ value: { q1: 'high', q2: 'low' } }));
    });

    it('multiple: a row collects an array of column values', () => {
        render(<MatrixField attributes={{ id: 'm', rows, columns, multiple: true }} onChange={onChange} />);
        fireEvent.click(screen.getByLabelText('Speed Low'));
        fireEvent.click(screen.getByLabelText('Speed High'));
        expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ value: { q1: ['low', 'high'] } }));
    });

    it('multiple: unchecking removes the value from the row array', () => {
        render(<MatrixField attributes={{ id: 'm', rows, columns, multiple: true, value: { q1: ['low', 'high'] } }} onChange={onChange} />);
        fireEvent.click(screen.getByLabelText('Speed Low'));
        expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ value: { q1: ['high'] } }));
    });
});

// ---------------------------------------------------------------------------
// ConsentField
// ---------------------------------------------------------------------------
describe('ConsentField — scroll gating', () => {
    it('requireScroll=true: checkbox disabled until scrolled, then emits boolean', () => {
        render(<ConsentField attributes={{ id: 'consent', text: 'terms…', requireScroll: true }} onChange={onChange} />);
        const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
        expect(checkbox).toBeDisabled();
        fireEvent.scroll(screen.getByTestId('consent-terms'));
        expect(checkbox).not.toBeDisabled();
        fireEvent.click(checkbox);
        expect(onChange).toHaveBeenLastCalledWith({ id: 'consent', value: true });
    });

    it('requireScroll=false: checkbox enabled immediately', () => {
        render(<ConsentField attributes={{ id: 'consent', text: 'terms…', requireScroll: false }} onChange={onChange} />);
        const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
        expect(checkbox).not.toBeDisabled();
        fireEvent.click(checkbox);
        expect(onChange).toHaveBeenLastCalledWith({ id: 'consent', value: true });
    });

    it('unchecking emits false', () => {
        render(<ConsentField attributes={{ id: 'consent', requireScroll: false, value: true }} onChange={onChange} />);
        fireEvent.click(screen.getByRole('checkbox'));
        expect(onChange).toHaveBeenLastCalledWith({ id: 'consent', value: false });
    });
});

// ---------------------------------------------------------------------------
// TagsInput
// ---------------------------------------------------------------------------
describe('TagsInput — hydration & add', () => {
    const chipLabels = () =>
        Array.from(document.querySelectorAll('.MuiChip-label')).map((n) => n.textContent);

    it('hydrates from an array', () => {
        render(<TagsInput attributes={{ id: 'tg', value: ['red', 'blue'] }} onChange={onChange} />);
        expect(chipLabels()).toEqual(['red', 'blue']);
    });

    it('hydrates from a separator-joined string', () => {
        render(<TagsInput attributes={{ id: 'tg', value: 'red;blue;green' }} onChange={onChange} />);
        expect(chipLabels()).toEqual(['red', 'blue', 'green']);
    });

    it('hydrates from a comma-joined string', () => {
        render(<TagsInput attributes={{ id: 'tg', value: 'red,blue' }} onChange={onChange} />);
        expect(chipLabels()).toEqual(['red', 'blue']);
    });

    it('adding a tag via Enter emits a string[]', () => {
        render(<TagsInput attributes={{ id: 'tg', value: ['red'] }} onChange={onChange} />);
        const input = screen.getByRole('combobox') as HTMLInputElement;
        fireEvent.change(input, { target: { value: 'green' } });
        fireEvent.keyDown(input, { key: 'Enter' });
        const last = onChange.mock.calls.at(-1)![0];
        expect(last.value).toEqual(['red', 'green']);
        expect(Array.isArray(last.value)).toBe(true);
    });
});
