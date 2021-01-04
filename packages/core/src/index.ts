import createSsr, { ExcludeSsr } from './iSSR';

export { isBackend, isClient } from './utils';
export * from './server';
export * from './hooks';
export { ExcludeSsr };

export default createSsr;
