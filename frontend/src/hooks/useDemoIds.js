import { useState, useEffect } from 'react';

import { api } from '../api';

export function useDemoIds() {
  const [ids, setIds] = useState({ customerId: null, vendorUserId: null, productId: null });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getDemoIds()
      .then((res) =>
        setIds({
          customerId: res.customerId,
          vendorUserId: res.vendorUserId,
          productId: res.productId,
        })
      )
      .catch(() => setIds({}))
      .finally(() => setLoading(false));
  }, []);

  return { ...ids, loading };
}
