// Global type declarations for the application

declare global {
  interface Window {
    LaravelAppGlobals?: {
      config?: {
        name?: string;
        url?: string;
        media_download_base?: {
          mp3: string;
          ogg: string;
          orig: string;
        };
      };
      user?: {
        name: string;
        avatar: string;
        role: string;
        permissions: string[];
      };
    };
  }
}

export {};
