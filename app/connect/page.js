'use client'

import {Alert, Button, Flex, Form, Input, InputNumber, List, message, Modal, Radio, Select, Space} from "antd";
import {React, useEffect, useRef, useState} from "react";
import {ArrowRightOutlined, EditOutlined, MinusCircleOutlined, PlusOutlined} from "@ant-design/icons";
import EditableTag from './editableTag';
import JSONFormat from "json-format";

const DEFAULT_CONNECT_CONFIG = {
    type: 'telnet',
    host: '',
    port: '23',
    username: '',
    password: '',
    charset: 'utf-8',
    timeoutMilliSeconds: '5000',
    keepActiveInterval: '60000',
    keepActiveCommand: ' ',
    keepActiveWaitTimeout: '2000',
    keepActiveWaitStr: '(!@#$%)',
    successFlags: [],
    failFlags: [],
    keepActiveEnable: true
};

const DEFAULT_COMMAND_CONFIG = {
    id: -1,
    command: '',
    timeoutMilliSeconds: '5000',
    successFlags: [],
    failFlags: [],
    enter: '\n',
};

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

const ModalForm = ({ open, onCancel, onOk, editingValue }) => {
    const [form] = Form.useForm();
    useResetFormOnCloseModal({
        form,
        open,
    });
    useEffect(() => {
        if (open && editingValue != null) {
            form.setFieldsValue(editingValue);
        }
    }, [form, editingValue, open]);
    return (
        <Modal title="指令详情" open={open} onOk={() => {onOk(form.getFieldsValue())}} onCancel={onCancel}>
            <Form form={form} labelCol={{span: 8}} wrapperCol={{span: 12}}
                  initialValues={DEFAULT_COMMAND_CONFIG}>
                <Form.Item name="id" style={{display: 'none'}}><Input /></Form.Item>
                <Form.Item name="command" label="命令"><Input /></Form.Item>
                <Form.Item name="timeoutMilliSeconds" label="超时时间" wrapperCol={{span: 6}}><Input suffix="毫秒"/></Form.Item>
                <Form.Item name="successFlags" label="成功标识">
                    <EditableTag color="green" />
                </Form.Item>
                <Form.Item name="failFlags" label="失败标识">
                    <EditableTag color="red" />
                </Form.Item>
                <Form.Item name="enter" label="回车符" wrapperCol={{span: 4}}>
                    <Select showSearch options={[{value: '\n', label: '\\n',}, {value: '\r\n', label: '\\r\\n'}]} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

function convertCommandArray(commandArray) {
    if(commandArray.length === 0) {
        return null;
    }
    const rootCommandObj = {};
    let currentCommandObj = rootCommandObj;
    for(let i = 0; i < commandArray.length; i++) {
        const commandEle = commandArray[i];
        currentCommandObj.command = commandEle.command;
        if (commandEle.timeoutMilliSeconds !== DEFAULT_COMMAND_CONFIG.timeoutMilliSeconds) {
            currentCommandObj.timeoutMilliSeconds = commandEle.timeoutMilliSeconds;
        }
        if (commandEle.enter !== DEFAULT_COMMAND_CONFIG.enter) {
            currentCommandObj.enter = commandEle.enter;
        }
        if (commandEle.successFlags.length > 0) {
            currentCommandObj.successFlags = commandEle.successFlags;
        }
        if (commandEle.failFlags.length > 0) {
            currentCommandObj.failFlags = commandEle.failFlags;
        }
        if((i + 1) < commandArray.length) {
            currentCommandObj.next = {};
            currentCommandObj = currentCommandObj.next;
        }
    }
    return rootCommandObj;
}

function convertCommandObj(commandObj) {
    if(!commandObj instanceof Object) {
        return [];
    }
    const commandArray = [];
    let index = 0;
    while (true) {
        const commandEle = {...DEFAULT_COMMAND_CONFIG, command: commandObj.command};
        if(commandObj.enter) {
            commandEle.enter = commandObj.enter;
        }
        if(commandObj.timeoutMilliSeconds) {
            commandEle.timeoutMilliSeconds = commandObj.timeoutMilliSeconds;
        }
        if(commandObj.successFlags && commandObj.successFlags.length > 0) {
            commandEle.successFlags = commandObj.successFlags;
        }
        if(commandObj.failFlags && commandObj.failFlags.length > 0) {
            commandEle.failFlags = commandObj.failFlags;
        }
        commandEle.id = index++;
        commandArray.push(commandEle);
        if(commandObj.next) {
            commandObj = commandObj.next;
        } else {
            break;
        }
    }
    return commandArray;
}

function convertJsonStringValue2NumberValue(str, keys) {
    for (let i in keys) {
        const key = keys[i];
        const regex = new RegExp(`"${key}": "(.*)"`, 'g');
        str = str.replace(regex, `"${key}": $1`);
    }
    return str;
}

function convertJsonNumberValue2StringValue(str, keys) {
    for(let i in keys) {
        const key = keys[i];
        const regex = new RegExp(`"${key}"\\s*:\\s*(\\S+?)\\s*([,}])`, 'g');
        str = str.replace(regex, `"${key}": "$1"$2`);
    }
    return str;
}

function App() {
    const { TextArea } = Input;
    const [form] = Form.useForm();
    const [postConnectCommands, setPostConnectCommands] = useState([]);
    const [isPccModalOpen, setIsPccModalOpen] = useState(false);
    const [preLogoutCommands, setPreLogoutCommands] = useState([]);
    const [isPlcModalOpen, setIsPlcModalOpen] = useState(false);
    const [editingCommand, setEditingCommand] = useState(null);
    const [extAttrs, setExtAttrs] = useState([]);
    const [jsonConfig, setJsonConfig] = useState('');
    const [messageApi, contextHolder] = message.useMessage();

    const outputToJson = () => {
        const connectConfigurerObj = {};
        const formValues = form.getFieldsValue();
        connectConfigurerObj.type = formValues.type;
        ['host', 'port', 'username', 'password', 'charset', 'timeoutMilliSeconds'].forEach(key => {
            if(formValues[key] && formValues[key] !== DEFAULT_CONNECT_CONFIG[key]) {
                connectConfigurerObj[key] = formValues[key];
            }
        });
        if(formValues.keepActiveEnable) {
            ['keepActiveInterval', 'keepActiveCommand', 'keepActiveWaitTimeout', 'keepActiveWaitStr'].forEach(key => {
                if(formValues[key] !== DEFAULT_CONNECT_CONFIG[key]) {
                    connectConfigurerObj[key] = formValues[key];
                }
            });
        } else {
            connectConfigurerObj.keepActiveCommand = '';
        }
        const convertedPcc = convertCommandArray(postConnectCommands);
        if (convertedPcc != null) {
            connectConfigurerObj.postConnect = convertedPcc;
        }
        const convertedPlc = convertCommandArray(preLogoutCommands);
        if (convertedPlc != null) {
            connectConfigurerObj.preLogout = convertedPlc;
        }
        if (formValues.successFlags.length > 0) {
            connectConfigurerObj.successFlags = formValues.successFlags;
        }
        if (formValues.failFlags.length > 0) {
            connectConfigurerObj.failFlags = formValues.failFlags;
        }
        if (extAttrs.length > 0) {
            const extAttrObj = {};
            extAttrs.forEach(extAttr => extAttrObj[extAttr.key] = extAttr.value);
            connectConfigurerObj.extAttrs = extAttrObj;
        }
        let newJsonConfig = JSONFormat(connectConfigurerObj);
        newJsonConfig = convertJsonStringValue2NumberValue(newJsonConfig, ['port', 'timeoutMilliSeconds', 'keepActiveInterval', 'keepActiveWaitTimeout']);
        setJsonConfig(newJsonConfig);
    };

    const inputFromJson = () => {
        const newJsonConfig = convertJsonNumberValue2StringValue(jsonConfig, ['port', 'timeoutMilliSeconds', 'keepActiveInterval', 'keepActiveWaitTimeout']);
        let connectConfigurerObj = null;
        try {
            connectConfigurerObj = JSON.parse(newJsonConfig);
        } catch (e) {

        }
        if (connectConfigurerObj == null) {
            messageApi.open({
                type: 'error',
                content: '非法JSON配置'
            });
            return;
        }
        form.resetFields();
        const newFormValues = {type: connectConfigurerObj.type};
        ['host', 'port', 'username', 'password', 'charset', 'timeoutMilliSeconds',
            'keepActiveInterval', 'keepActiveCommand', 'keepActiveWaitTimeout', 'keepActiveWaitStr', 'successFlags', 'failFlags'].forEach(key => {
            if(connectConfigurerObj[key] && connectConfigurerObj[key] !== DEFAULT_CONNECT_CONFIG[key]) {
                newFormValues[key] = connectConfigurerObj[key];
            }
        });
        if(connectConfigurerObj.keepActiveCommand && connectConfigurerObj.keepActiveCommand === '') {
            newFormValues.keepActiveEnable = false;
        }
        form.setFieldsValue(newFormValues);
        if(connectConfigurerObj.postConnect) {
            setPostConnectCommands(convertCommandObj(connectConfigurerObj.postConnect));
        } else {
            setPostConnectCommands([]);
        }
        if(connectConfigurerObj.preLogout) {
            setPreLogoutCommands(convertCommandObj(connectConfigurerObj.preLogout));
        } else {
            setPreLogoutCommands([]);
        }
        if (connectConfigurerObj.extAttrs) {
            const newExtAttrs = [];
            let extAttrIndex = 0;
            for(let key in connectConfigurerObj.extAttrs) {
                newExtAttrs.push({id: extAttrIndex++, key: key, value: connectConfigurerObj.extAttrs[key]});
            }
            setExtAttrs(newExtAttrs);
        } else {
            setExtAttrs([]);
        }
    };

    const savePostConnectCommands = value => {
        if(value.id !== -1) {
            const newPostConnectCommands = [...postConnectCommands];
            const index = newPostConnectCommands.findIndex(ele => ele.id === value.id);
            newPostConnectCommands[index] = value;
            setPostConnectCommands(newPostConnectCommands);
        } else {
            value.id = postConnectCommands.length > 0 ? postConnectCommands[postConnectCommands.length - 1].id + 1 : 0;
            setPostConnectCommands([...postConnectCommands, value]);
        }
        setIsPccModalOpen(false);
    };
    const deletePostConnectCommands = value => {
        setPostConnectCommands(postConnectCommands.filter(item => item.id !== value.id));
    }
    const savePreLogoutCommands = value => {
        if (value.id !== -1) {
            const newPreLogoutCommands = [...preLogoutCommands];
            const index = newPreLogoutCommands.findIndex(ele => ele.id === value.id);
            newPreLogoutCommands[index] = value;
            setPreLogoutCommands(newPreLogoutCommands);
        } else {
            value.id = preLogoutCommands.length > 0 ? preLogoutCommands[preLogoutCommands.length - 1].id + 1 : 0;
            setPreLogoutCommands([...preLogoutCommands, value]);
        }
        setIsPlcModalOpen(false);
    };
    const deletePreLogoutCommands = value => {
        setPreLogoutCommands(preLogoutCommands.filter(item => item.id !== value.id))
    }
    const renderPostConnectCommandItem = (item) => {
        return (<List.Item
            actions={[
                <EditOutlined key={item.id} onClick={() => {
                    setEditingCommand(item);
                    setIsPccModalOpen(true);
                }}/>,
                <MinusCircleOutlined key={item.id} className="dynamic-delete-button" onClick={() => deletePostConnectCommands(item)}/>,
            ]}
        >
            {item.command}
        </List.Item>)
    };
    const renderPreLogoutCommandItem = (item) => {
        return (<List.Item
            actions={[
                <EditOutlined key={item.id} onClick={() => {
                    setEditingCommand(item);
                    setIsPlcModalOpen(true);
                }}/>,
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
        {contextHolder}
        <div style={{ width: '49%'}} >
            <Form name="basic" form={form} labelCol={{span: 8}} wrapperCol={{span: 16}} style={{maxWidth: 600}}
                  initialValues={DEFAULT_CONNECT_CONFIG}>
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
                    {() => (form.getFieldValue('type') === 'ssh' || form.getFieldValue('type') === 'telnet') && (
                        <>
                            <Form.Item label="IP" name="host" wrapperCol={{span: 8}}>
                                <Input />
                            </Form.Item>
                            <Form.Item label="端口" name="port" wrapperCol={{span: 3}}>
                                <Input />
                            </Form.Item>
                        </>
                    )}
                </Form.Item>
                <Form.Item noStyle dependencies={['type']}>
                    {() => form.getFieldValue('type') === 'ssh' && (
                        <>
                            <Form.Item label="用户名" name="username" wrapperCol={{span: 6}}>
                                <Input />
                            </Form.Item>
                            <Form.Item label="密码" name="password" wrapperCol={{span: 6}}>
                                <Input />
                            </Form.Item>
                        </>
                    )}
                </Form.Item>
                <Form.Item label="编码" name="charset" wrapperCol={{span: 3}}>
                    <Select showSearch options={[{value: 'utf-8', label: 'utf-8',}, {value: 'gbk', label: 'gbk'}]} />
                </Form.Item>
                <Form.Item label="连接后命令">
                    {postConnectCommands.length > 0 && <List
                        size="small"
                        bordered
                        dataSource={postConnectCommands}
                        renderItem={renderPostConnectCommandItem}
                    />}
                    <Button icon={<PlusOutlined />} onClick={() => {
                        setEditingCommand(null);
                        setIsPccModalOpen(true);
                    }}>
                    </Button>
                </Form.Item>
                <Form.Item label="登出前命令">
                    {preLogoutCommands.length > 0 && <List
                        size="small"
                        bordered
                        dataSource={preLogoutCommands}
                        renderItem={renderPreLogoutCommandItem}
                    />}
                    <Button icon={<PlusOutlined />} onClick={() => {
                        setEditingCommand(null);
                        setIsPlcModalOpen(true);
                    }}>
                    </Button>
                </Form.Item>
                <Form.Item name="successFlags" label="成功标识">
                    <EditableTag color="green" />
                </Form.Item>
                <Form.Item name="failFlags" label="失败标识">
                    <EditableTag color="red" />
                </Form.Item>
                <Form.Item name="timeoutMilliSeconds" label="超时时间" wrapperCol={{span: 6}}><Input suffix="毫秒"/></Form.Item>
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
                            <Form.Item name="keepActiveInterval" label="保活周期" wrapperCol={{span: 6}}>
                                <Input prefix="每" suffix="毫秒"/>
                            </Form.Item>
                            <Alert message="注意文本框中包含了默认的保活命令空格字符" type="info" showIcon style={{marginLeft: '200px'}}/>
                            <Form.Item label="保活命令" name="keepActiveCommand">
                                <Input />
                            </Form.Item>
                            <Alert message="保活命令结束符可以不在回显中出现，此时保活命令会一直执行到超时" type="info" showIcon style={{marginLeft: '200px'}}/>
                            <Form.Item name="keepActiveWaitStr" label="保活命令结束符" wrapperCol={{span: 6}}>
                                <Input />
                            </Form.Item>
                            <Form.Item name="keepActiveWaitTimeout" label="保活命令超时时间" wrapperCol={{span: 6}}>
                                <Input suffix="毫秒" />
                            </Form.Item>
                            </>
                        )
                    }
                </Form.Item>
            </Form>
            <ModalForm open={isPccModalOpen} onCancel={() => setIsPccModalOpen(false)} onOk={savePostConnectCommands} editingValue={editingCommand} />
            <ModalForm open={isPlcModalOpen} onCancel={() => setIsPlcModalOpen(false)} onOk={savePreLogoutCommands} editingValue={editingCommand} />
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