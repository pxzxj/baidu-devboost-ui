'use client'

import {Button, Divider, Flex, Form, Input, InputNumber, List, Space, Table, Tabs} from "antd";
import {React, useState} from "react";
import {DeleteOutlined, PlusOutlined} from "@ant-design/icons";

const {TabPane} = Tabs;

const DEFAULT_TABLE_DATA = {
    columns: [{title: 'Name', dataIndex: 'name'}],
    data: [{key: '1', name: 'Josh Long'}]
}

function App() {
    const { TextArea } = Input;

    const [jsonText, setJsonText] = useState('');
    const [tableData, setTableData] = useState(DEFAULT_TABLE_DATA);

    return (
        <Flex wrap="wrap" gap="middle" vertical={false}>
            <div style={{ width: '100%'}} >
                <TextArea value = {jsonText}
                          onChange = {(e) => setJsonText(e.target.value)}
                          autoSize={{ minRows: 10, maxRows: 15 }}
                />
            </div>
            <Divider />
            <div style={{ width: '44%'}} >
                <Space>
                    <Button type="primary">解析</Button>
                    <Button>建表语句</Button>
                </Space>
                <Tabs defaultActiveKey="field" centered={true}>
                    <TabPane tab="字段型" key="field">
                        <Form name="basic" labelCol={{span: 8,}} wrapperCol={{span: 16,}} style={{maxWidth: 600,}} initialValues={{remember: true,}} autoComplete="off">
                            <Form.Item label="分隔符" name="delimiter"><Input/></Form.Item>
                            <Form.Item label="最小行数" name="minLineCount">
                                <InputNumber style={{width: '50px'}} min={1} max={1000} defaultValue={3} />
                            </Form.Item>
                            <Form.Item label="最小字段数" name="minFieldCount">
                                <InputNumber style={{width: '50px'}} min={1} max={1000} defaultValue={3} />
                            </Form.Item>
                            <Form.Item>
                                <Button>自动识别</Button>
                            </Form.Item>
                            <Form.Item>
                                <Input style={{width: '200px'}} /> <Button>忽略行</Button>
                            </Form.Item>
                            <Form.Item>
                                <List
                                    size="small"
                                    bordered
                                    dataSource={['qqqqqqqqqq', 'wwwwwwwwwwww', 'eeeeeeeeeeee']}
                                    renderItem={(item) => <List.Item>{item}</List.Item>}
                                />
                            </Form.Item>
                            <Form.Item>
                                <Table columns={DEFAULT_TABLE_DATA.columns} dataSource={DEFAULT_TABLE_DATA.data} pagination={false} />
                            </Form.Item>
                        </Form>
                    </TabPane>
                    <TabPane tab={"正则型"} key="pattern">
                        正则
                        <Input/>
                        <Table columns={DEFAULT_TABLE_DATA.columns} dataSource={DEFAULT_TABLE_DATA.data} pagination={false} />
                    </TabPane>
                </Tabs>
            </div>
            <div style={{ width: '10%'}}>
                <br/>
                <br/>
                <br/>
                <Button>&gt;json</Button>
                <br/>
                <br/>
                <br/>
                <Button>&lt;json</Button>
            </div>
            <div style={{ width: '44%'}} >
                <TextArea autoSize={{ minRows: 10, maxRows: 15 }} />
            </div>
            <Divider />
            <div>
                <Table columns={tableData.columns} dataSource={tableData.data} pagination={false} />
            </div>
        </Flex>
    );
}

export default App;