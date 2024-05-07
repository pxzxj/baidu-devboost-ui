'use client'

import {Button, Flex, Form, Input, List, Modal, Radio, Select, Space} from "antd";
import {React, useState} from "react";
import {PlusOutlined} from "@ant-design/icons";

function App() {
    const { TextArea } = Input;
    const [type, setType] = useState("telnet");
    const [postConnectCommands, setPostConnectCommands] = useState([]);
    const [isPccModalOpen, setIsPccModalOpen] = useState(false);
    const [preLogoutCommands, setPreLogoutCommands] = useState([]);
    const [isPlcModalOpen, setIsPlcModalOpen] = useState(false);
    const [jsonConfig, setJsonConfig] = useState('');

    const renderCommandItem = (item) => {
        return (<List.Item
            actions={[
                <Button key={item.id} type="link">
                    删除
                </Button>
            ]}
        >
            {item.value}
        </List.Item>)
    };

    const outputToJson = () => {

    };

    const inputFromJson = () => {

    };

    return (<Flex wrap="wrap" gap="middle" vertical={false}>
        <div style={{ width: '49%'}} >
            <Form>
                <Form.Item label="类型">
                    <Radio.Group name="type" onChange={(e) => setType(e.target.value)} value={type}>
                        <Space>
                            <Radio value="telnet">telnet</Radio>
                            <Radio value="ssh">ssh</Radio>
                            <Radio value="shell">shell</Radio>
                        </Space>
                    </Radio.Group>
                </Form.Item>
                <Form.Item label="用户名" name="username">
                    <Input />
                </Form.Item>
                <Form.Item label="密码" name="password">
                    <Input />
                </Form.Item>
                <Form.Item label="编码" name="charset">
                    <Select showSearch options={[{value: 'utf-8', label: 'utf-8',}, {value: 'gbk', label: 'gbk'}]} />
                </Form.Item>
                <Form.Item label="连接后命令" name="postConnect">
                    {postConnectCommands.length > 0 && <List
                        size="small"
                        bordered
                        dataSource={postConnectCommands}
                        renderItem={renderCommandItem}
                    />}
                    <Button icon={<PlusOutlined />} onClick={() => setIsPccModalOpen(true)}>
                    </Button>
                </Form.Item>
                <Form.Item label="登出前命令" name="preLogout">
                    {preLogoutCommands.length > 0 && <List
                        size="small"
                        bordered
                        dataSource={preLogoutCommands}
                        renderItem={renderCommandItem}
                    />}
                    <Button icon={<PlusOutlined />} onClick={() => setIsPlcModalOpen(true)}>
                    </Button>
                </Form.Item>

            </Form>
            <Modal title="Basic Modal" open={isPccModalOpen} onOk={() => setIsPccModalOpen(false)} onCancel={() => setIsPccModalOpen(false)}>
                <p>Some contents111...</p>
                <p>Some contents...</p>
                <p>Some contents...</p>
            </Modal>
            <Modal title="Basic Modal" open={isPlcModalOpen} onOk={() => setIsPlcModalOpen(false)} onCancel={() => setIsPlcModalOpen(false)}>
                <p>Some contents222...</p>
                <p>Some contents...</p>
                <p>Some contents...</p>
            </Modal>
        </div>
        <div style={{ width: '5%'}}>
            <br/>
            <br/>
            <br/>
            <Button onClick={outputToJson}>&gt;json</Button>
            <br/>
            <br/>
            <br/>
            <Button onClick={inputFromJson}>&lt;json</Button>
        </div>
        <div style={{ width: '44%'}} >
            <TextArea autoSize={{ minRows: 10, maxRows: 15 }} value={jsonConfig} onChange={(e) => setJsonConfig(e.target.value)}/>
        </div>
    </Flex>)
}

export default App;