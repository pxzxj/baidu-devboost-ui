import React, { useState } from 'react';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
} from '@ant-design/icons';
import { Button, Layout, Menu, theme } from 'antd';
import Link from "next/link";

const { Header, Sider, Content } = Layout;
export default function App ({children}) {
    const [collapsed, setCollapsed] = useState(false);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    return (
        <Layout>
            <Sider trigger={null} collapsible collapsed={collapsed} theme="light">
                <div className="demo-logo-vertical" >
                    <img src="https://pxzxj.github.io/articles/images/logo.png"  alt="logo" style={{width: '100%', height: 'auto'}}/>
                </div>
                <Menu mode="inline">
                    <Menu.Item key="jsonflatter"><Link href="/jsonflatter" />Json解析</Menu.Item>
                    <Menu.Item key="echoparser"><Link href="/echoparser" />回显解析</Menu.Item>
                    <Menu.Item key="encrypt"><Link href="/encrypt" />加解密</Menu.Item>
                    <Menu.Item key="connect"><Link href="/connect" />设备连接</Menu.Item>
                </Menu>
            </Sider>
            <Layout>
                <Header
                    style={{
                        padding: 0,
                        background: colorBgContainer,
                    }}
                >
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            fontSize: '16px',
                            width: 64,
                            height: 64,
                        }}
                    />
                </Header>
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};