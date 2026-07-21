import { lazy } from 'react';

// ── Eager: the common, lightweight form primitives. Kept in the main bundle so
//    a typical form renders instantly with no loading flicker. ─────────────────
import Typography from './Typography/typography';
import TextField from './TextField/textfield';
import NumberField from './NumberField/numberfield';
import Select from './Select/select';
import AutoComplete from './Autocomplete/autocomplete';
import CheckBox from './CheckBox/checkbox';
import Radio from './Radio/radio';
import Switch from './Switch/switch';
import Button from './Button/button';
import Divider from './Divider/divider';
import Computed from './Computed/computed';
import Alert from './Alert/alert';
import DateTime from './DateTime/datetime';
import DateTimePicker from './DateTimePicker/datetimepicker';
import TimePicker from './TimePicker/timepicker';
import DateRangePicker from './DateRangePicker/daterangepicker';
import Chip from './Chip/chip';
import ChipSelect from './ChipSelect/chipselect';
import Slider from './Slider/slider';
import Rating from './Rating/rating';
import ToggleButtons from './ToggleButtons/togglebuttons';
import PasswordField from './PasswordField/passwordfield';
import OtpField from './OtpField/otpfield';
import PhoneField from './PhoneField/phonefield';
import CurrencyField from './CurrencyField/currencyfield';
import Hyperlink from './Hyperlink/hyperlink';

// ── Lazy: heavier or less-common controls (and every control that pulls a big
//    3rd-party dep — charts, data grid, signature, rich text, maps, etc.). These
//    are code-split into their own chunks and loaded on demand, so they stay OUT
//    of an app's initial bundle. DynamicComponent wraps every control in Suspense,
//    so a control only loads when it's actually rendered. Using dynamic import for
//    the container controls (Wizard/Repeater/Summary/Stepper) also breaks their
//    static import cycle with FormGenerator. ─────────────────────────────────────
const Table = lazy(() => import('./DataTable/datatable'));
const Bar = lazy(() => import('../charts/Bar/bar'));
const Line = lazy(() => import('../charts/Line/line'));
const Pie = lazy(() => import('../charts/Pie/pie'));
const MixChart = lazy(() => import('../charts/Mixchart/mixChart'));
const TagsInput = lazy(() => import('./TagsInput/tagsinput'));
const FileUpload = lazy(() => import('./FileUpload/fileupload'));
const KeyValueField = lazy(() => import('./KeyValueField/keyvaluefield'));
const NumberStepper = lazy(() => import('./NumberStepper/numberstepper'));
const MatrixField = lazy(() => import('./MatrixField/matrixfield'));
const ConsentField = lazy(() => import('./ConsentField/consentfield'));
const ColorPicker = lazy(() => import('./ColorPicker/colorpicker'));
const MarkdownEditor = lazy(() => import('./MarkdownEditor/markdowneditor'));
const AddressField = lazy(() => import('./AddressField/addressfield'));
const CascadeSelect = lazy(() => import('./CascadeSelect/cascadeselect'));
const FormWizard = lazy(() => import('./FormWizard/formwizard'));
const SummaryField = lazy(() => import('./SummaryField/summaryfield'));
const GeoField = lazy(() => import('./GeoField/geofield'));
const RichTextEditor = lazy(() => import('./RichTextEditor/richtexteditor'));
const NpsScale = lazy(() => import('./NpsScale/npsscale'));
const EditableTable = lazy(() => import('./EditableTable/editabletable'));
const IntlPhone = lazy(() => import('./IntlPhone/intlphone'));
const AsyncAutocomplete = lazy(() => import('./AsyncAutocomplete/asyncautocomplete'));
const List = lazy(() => import('./List/list'));
const MultiTextbox = lazy(() => import('./MultiTextbox/multitextbox'));
const LineItemList = lazy(() => import('./LineItemList/lineitemlist'));
const FormRepeater = lazy(() => import('./FormRepeater/formrepeater'));
const Signature = lazy(() => import('./Signature/signature'));
const Group = lazy(() => import('./Group/group'));
const Accordion = lazy(() => import('./Accordion/accordion'));
const Tabs = lazy(() => import('./Tabs/tabs'));
const Stepper = lazy(() => import('./Stepper/stepper'));
const ImgList = lazy(() => import('./ImageList/imagelist'));
const LocationField = lazy(() => import('./LocationField/locationfield'));

const Controls = {
    Typography,
    TextField,
    Table,
    DateTime,
    DateTimePicker,
    TimePicker,
    Select,
    CheckBox,
    Switch,
    Radio,
    Stepper,
    Bar,
    Line,
    Pie,
    MixChart,
    Divider,
    Chip,
    ChipSelect,
    Button,
    DateRangePicker,
    Rating,
    Slider,
    TagsInput,
    ToggleButtons,
    PasswordField,
    OtpField,
    PhoneField,
    CurrencyField,
    FileUpload,
    Alert,
    Computed,
    KeyValueField,
    NumberStepper,
    MatrixField,
    ConsentField,
    ColorPicker,
    MarkdownEditor,
    AddressField,
    CascadeSelect,
    FormWizard,
    SummaryField,
    GeoField,
    RichTextEditor,
    NpsScale,
    EditableTable,
    IntlPhone,
    AsyncAutocomplete,
    List,
    NumberField,
    MultiTextbox,
    LineItemList,
    FormRepeater,
    Signature,
    Group,
    Accordion,
    Tabs,
    AutoComplete,
    ImgList,
    Hyperlink,
    LocationField
};

export default Controls;
