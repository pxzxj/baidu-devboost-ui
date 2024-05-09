'use client'

import {Alert, Button, Flex, Form, Input, InputNumber, List, Modal, Radio, Select, Space} from "antd";
import {React, useEffect, useRef, useState} from "react";
import {ArrowRightOutlined, MinusCircleOutlined, PlusOutlined} from "@ant-design/icons";
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
    const [form] = Form.useForm();
    useResetFormOnCloseModal({
        form,
        open,
    });
    return (
        <Modal title="指令详情" open={open} onOk={() => {onOk(form.getFieldsValue())}} onCancel={onCancel}>
            <Form form={form} labelCol={{span: 8}} wrapperCol={{span: 16}} style={{maxWidth: 600}}
                  initialValues={{
                successFlags: [],
                failFlags: [],
            }}>
                <Form.Item name="command" label="命令"><Input /></Form.Item>
                <Form.Item name="timeoutMilliSeconds" label="超时时间"><Input suffix="毫秒"/></Form.Item>
                <Form.Item name="successFlags" label="成功标识">
                    <EditableTag color="green" />
                </Form.Item>
                <Form.Item name="failFlags" label="失败标识">
                    <EditableTag color="red" />
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
    const [form] = Form.useForm();
    const [postConnectCommands, setPostConnectCommands] = useState([]);
    const [isPccModalOpen, setIsPccModalOpen] = useState(false);
    const [preLogoutCommands, setPreLogoutCommands] = useState([]);
    const [isPlcModalOpen, setIsPlcModalOpen] = useState(false);
    const [extAttrs, setExtAttrs] = useState([]);
    const [jsonConfig, setJsonConfig] = useState('');

    const outputToJson = () => {

    };

    const inputFromJson = () => {

    };

    const appendPostConnectCommands = value => {
        setIsPccModalOpen(false);
        value.id = postConnectCommands.length > 0 ? postConnectCommands[postConnectCommands.length - 1].id + 1 : 0;
        setPostConnectCommands([...postConnectCommands, value]);
    };
    const deletePostConnectCommands = value => {
        setPostConnectCommands(postConnectCommands.filter(item => item.id !== value.id));
    }
    const appendPreLogoutCommands = value => {
        setIsPlcModalOpen(false);
        value.id = preLogoutCommands.length > 0 ? preLogoutCommands[preLogoutCommands.length - 1].id + 1 : 0;
        setPreLogoutCommands([...preLogoutCommands, value]);
    };
    const deletePreLogoutCommands = value => {
        setPreLogoutCommands(preLogoutCommands.filter(item => item.id !== value.id))
    }
    const renderPostConnectCommandItem = (item) => {
        return (<List.Item
            actions={[
                <MinusCircleOutlined key={item.id} className="dynamic-delete-button" onClick={() => deletePostConnectCommands(item)}/>,
            ]}
        >
            {item.command}
        </List.Item>)
    };
    const renderPreLogoutCommandItem = (item) => {
        return (<List.Item
            actions={[
                <MinusCircleOutlined key={item.id} className="dynamic-delete-button" onClick={() => deletePreLogoutCommands(item)}/>,
            ]}
        >
            {item.command}
        </List.Item>)
    };
    const saveExtAttr = (id, key, value) => {
        const newExtAttrs = [...extAttrs];
        const extAttr = newExtAttrs.filter(attr => attr.id === id)[0];
        extAttr.key = key;
        extAttr.value = value;
        setExtAttrs(newExtAttrs);
    }
    const deleteExtAttr = (value) => {
        setExtAttrs(extAttrs.filter(item => item.id !== value.id));
    }
    const renderAttrItem = item => {
        return (<List.Item
            actions={[
                <MinusCircleOutlined key={item.id} className="dynamic-delete-button" onClick={() => deleteExtAttr(item)}/>,
            ]}>
                <Input defaultValue={item.key} onBlur={(e) => {saveExtAttr(item.id, e.target.value, item.value)}} style={{width: '30%'}} />
            <ArrowRightOutlined />
            <Input defaultValue={item.value} onBlur={(e) => {saveExtAttr(item.id, item.key, e.target.value)}} style={{width: 'auto'}} />
            </List.Item>);
    };
    const addExtAttr = () => {
        const id = extAttrs.length > 0 ? extAttrs[extAttrs.length - 1].id + 1 : 0;
        setExtAttrs([...extAttrs, {id: id, key: '', value: ''}]);
    };
    return (<Flex wrap="wrap" gap="middle" vertical={false}>
        <div style={{ width: '49%'}} >
            <Form name="basic" form={form} labelCol={{span: 8}} wrapperCol={{span: 16}} style={{maxWidth: 600}}
                  initialValues={{
                      type: 'telnet',
                      successFlags: [],
                      failFlags: [],
                      keepActiveEnable: true
            }}>
                <Form.Item label="类型" name="type">
                    <Radio.Group>
                        <Space>
                            <Radio value="telnet">telnet</Radio>
                            <Radio value="ssh">ssh</Radio>
                            <Radio value="shell">shell</Radio>
                        </Space>
                    </Radio.Group>
                </Form.Item>
                <Form.Item noStyle dependencies={['type']}>
                    {() => form.getFieldValue('type') === 'ssh' && (<>
                        <Form.Item label="用户名" name="username">
                            <Input />
                        </Form.Item>
                        <Form.Item label="密码" name="password">
                            <Input />
                        </Form.Item>
                    </>)}
                </Form.Item>
                <Form.Item label="编码" name="charset">
                    <Select showSearch options={[{value: 'utf-8', label: 'utf-8',}, {value: 'gbk', label: 'gbk'}]} />
                </Form.Item>
                <Form.Item label="连接后命令">
                    {postConnectCommands.length > 0 && <List
                        size="small"
                        bordered
                        dataSource={postConnectCommands}
                        renderItem={renderPostConnectCommandItem}
                    />}
                    <Button icon={<PlusOutlined />} onClick={() => setIsPccModalOpen(true)}>
                    </Button>
                </Form.Item>
                <Form.Item label="登出前命令">
                    {preLogoutCommands.length > 0 && <List
                        size="small"
                        bordered
                        dataSource={preLogoutCommands}
                        renderItem={renderPreLogoutCommandItem}
                    />}
                    <Button icon={<PlusOutlined />} onClick={() => setIsPlcModalOpen(true)}>
                    </Button>
                </Form.Item>
                <Form.Item name="successFlags" label="成功标识">
                    <EditableTag color="green" />
                </Form.Item>
                <Form.Item name="failFlags" label="失败标识">
                    <EditableTag color="red" />
                </Form.Item>
                <Form.Item name="timeoutMilliSeconds" label="超时时间"><Input suffix="毫秒"/></Form.Item>
                <Form.Item label="扩展属性">
                    {extAttrs.length > 0 && <List
                        size="small"
                        bordered
                        dataSource={extAttrs}
                        renderItem={renderAttrItem}
                    />}
                    <Button icon={<PlusOutlined />} onClick={addExtAttr}>
                    </Button>
                </Form.Item>
                <Form.Item name="keepActiveEnable" label="是否保活">
                    <Radio.Group>
                        <Radio value={true}>是</Radio>
                        <Radio value={false}>否</Radio>
                    </Radio.Group>
                </Form.Item>
                <Form.Item noStyle dependencies={['keepActiveEnable']}>
                    {() => form.getFieldValue('keepActiveEnable') &&
                        (<>
                            <Form.Item name="keepActiveInterval" label="保活周期">
                                <Input prefix="每" suffix="毫秒"/>
                            </Form.Item>
                            <Alert message="注意文本框中包含了默认的保活命令空格字符" type="info" showIcon />
                            <Form.Item label="保活命令" name="keepActiveCommand">
                                <Input />
                            </Form.Item>
                            <Form.Item name="keepActiveWaitStr" label="保活命令结束符">
                                <Input />
                            </Form.Item>
                            <Form.Item name="keepActiveWaitTimeout" label="保活命令超时时间">
                                <Input suffix="毫秒" />
                            </Form.Item>
                            </>
                        )
                    }
                </Form.Item>
            </Form>
            <ModalForm open={isPccModalOpen} onCancel={() => setIsPccModalOpen(false)} onOk={appendPostConnectCommands} />
            <ModalForm open={isPlcModalOpen} onCancel={() => setIsPlcModalOpen(false)} onOk={appendPreLogoutCommands} />
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