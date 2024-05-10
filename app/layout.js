'use client'

import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import App from './app';
import zhCN from 'antd/locale/zh_CN';
import {ConfigProvider} from "antd";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AntdRegistry>
            <ConfigProvider locale={zhCN}>
                <App>
                    {children}
                </App>
            </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
