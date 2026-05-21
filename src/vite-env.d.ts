/// <reference types="react" />
/// <reference types="react-dom" />
/// <reference types="vite/client" />
import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}