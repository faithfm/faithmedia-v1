// Type definitions for global objects used in tests

interface RouteFunction {
  (name: string, params?: Record<string, any>): string;
}

interface InertiaObject {
  visit: (url: string, options?: any) => void;
  replace: (url: string, options?: any) => void;
  reload: (options?: any) => void;
  get: (url: string, data?: any, options?: any) => Promise<any>;
  post: (url: string, data?: any, options?: any) => Promise<any>;
  put: (url: string, data?: any, options?: any) => Promise<any>;
  patch: (url: string, data?: any, options?: any) => Promise<any>;
  delete: (url: string, options?: any) => Promise<any>;
}

interface InertiaProgressObject {
  init: (options?: any) => void;
}

declare global {
  var route: RouteFunction;
  var Inertia: InertiaObject;
  var InertiaProgress: InertiaProgressObject;
}

export {};
