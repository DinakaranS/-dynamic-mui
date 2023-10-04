import { useEffect } from 'react';

import useIsFirstRender from './useIsFirstRender';

export default function useUpdateEffect(effect, deps) {
  const isFirst = useIsFirstRender();

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (!isFirst) {
      return effect();
    }
  }, deps);
}
