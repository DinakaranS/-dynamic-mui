import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';

// `@mui/x-date-pickers` v7/v8's AdapterDayjs calls `value.isUTC()` / timezone
// helpers during normal operation, which require these plugins to be extended on
// the SAME dayjs instance the adapter uses. Because `dayjs` is an (externalized)
// peer, extending it here reaches the shared instance the picker relies on —
// without this the pickers throw "value.isUTC is not a function".
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

export default dayjs;
