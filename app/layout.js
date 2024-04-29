'use client'

import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import App from './app';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AntdRegistry>
            <App>
                {children}
            </App>
        </AntdRegistry>
      </body>
    </html>
  );
}
