'use client'

import {Button, Flex, Form, Input, InputNumber, List, Modal, Radio, Select, Space} from "antd";
import {React, useEffect, useRef, useState} from "react";
import {PlusOutlined} from "@ant-design/icons";
import EditableTag from './editableTag';

// reset form fields when modal is form, closed
const useResetFormOnCloseModal = ({ form, open }) => {
    const prevOpenRef = useRef();
    useEffect(() => {
        prevOpenRef.current = open;
    }, [open]);
    const prevOpen = prevOpenRef.current;
    useEffect(() => {
        if (!open && prevOpen) {
            form.resetFields();
        }
    }, [form, prevOpen, open]);
};

const ModalForm = ({ open, onCancel, onOk }) => {
    const [successFlags, setSuccessFlags] = useState([]);
    const [failFlags, setFailFlags] = useState([]);
    const [form] = Form.useForm();
    useResetFormOnCloseModal({
        form,
        open,
    });
    return (
        <Modal title="指令详情" open={open} onOk={onOk} onCancel={onCancel}>
            <Form form={form} labelCol={{span: 8}} wrapperCol={{span: 16}} style={{maxWidth: 600}}>
                <Form.Item name="command" label="命令"><Input /></Form.Item>
                <Form.Item name="timeoutMilliSeconds" label="超时时间"><InputNumber /></Form.Item>
                <Form.Item name="successFlags" label="成功标识">
                    <EditableTag tags={successFlags} setTags={setSuccessFlags} color="green" />
                </Form.Item>
                <Form.Item name="failFlags" label="失败标识">
                    <EditableTag tags={failFlags} setTags={setFailFlags} color="red" />
                </Form.Item>
                <Form.Item name="enter" label="回车符">
                    <Select showSearch options={[{value: '\n', label: '\\n',}, {value: '\r\n', label: '\\r\\n'}]} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

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
            <Form name="basic" labelCol={{span: 8}} wrapperCol={{span: 16}} style={{maxWidth: 600}}>
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
            <ModalForm open={isPccModalOpen} onOk={() => setIsPccModalOpen(false)} onCancel={() => setIsPccModalOpen(false)} />
            <ModalForm open={isPlcModalOpen} onOk={() => setIsPlcModalOpen(false)} onCancel={() => setIsPlcModalOpen(false)} />
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