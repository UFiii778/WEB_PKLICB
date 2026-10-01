import { createContext, useContext } from 'react';

// Query pencarian di header dibagikan ke seluruh halaman admin.
export const SearchContext = createContext({ query: '', setQuery: () => {} });
export const useSearch = () => useContext(SearchContext).query;

export const matches = (query, ...fields) => {
    const q = (query || '').trim().toLowerCase();
    if (!q) return true;
    return fields.some((f) => String(f ?? '').toLowerCase().includes(q));
};
