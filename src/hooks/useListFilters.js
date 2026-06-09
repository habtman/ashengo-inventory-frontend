import { useState, useMemo } from "react";
import useDebounce from "./useDebounce";

export default function useListFilters(initial = {}) {
  const [search, setSearch] = useState(initial.search || "");
  const [page, setPage] = useState(initial.page || 1);
  const [limit, setLimit] = useState(initial.limit || 10);

  const [filters, setFilters] = useState(initial.filters || {});

  const debouncedSearch = useDebounce(search, 400);

  // 🔥 Build query params dynamically
  const params = useMemo(() => {
    return {
      page,
      limit,
      search: debouncedSearch || undefined,
      ...filters,
    };
  }, [page, limit, debouncedSearch, filters]);

  return {
    // raw state
    search,
    setSearch,
    page,
    setPage,
    limit,
    setLimit,
    filters,
    setFilters,

    // computed
    params,
  };
}
