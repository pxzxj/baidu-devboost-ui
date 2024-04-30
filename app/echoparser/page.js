'use client'

import {Button, Divider, Empty, Flex, Form, Input, InputNumber, List, message, Table, Tabs} from "antd";
import {React, useState} from "react";
import PatternFieldTable from './fieldsTable4typepattern';
import FieldFieldTable from './fieldsTable4typefield';
import detect from './field-detector';

import JSONFormat from 'json-format';


const {TabPane} = Tabs;

const DEFAULT_TABLE_DATA = {
    columns: [{title: 'Name', dataIndex: 'name'}],
    data: [{key: '1', name: 'Josh Long'}]
}

const DEFAULT_DELIMITER = '[|\\s=:]+';

function App() {
    const { TextArea } = Input;

    const [echo, setEcho] = useState('');
    const [activeKey, setActiveKey] = useState('field');
    const [delimiter, setDelimiter] = useState(DEFAULT_DELIMITER);
    const [minLineCount, setMinLineCount] = useState(3);
    const [minFieldCount, setMinFieldCount] = useState(3);
    const [ignoreLinePatternValue, setIgnoreLinePatternValue] = useState('');
    const [ignoreLinePatterns, setIgnoreLinePatterns] = useState([]);
    const [patternFieldTableDataSource, setPatternFieldTableDataSource] = useState([{key: '0', 'name': ''}]);
    const [fieldFieldTableDataSource, setFieldFieldTableDataSource] = useState([{
        key: '0',
        name: '',
        matchName: '',
        valuePattern: '',
        nullable: false,
    }]);
    const [jsonConfig, setJsonConfig] = useState('');
    const [tableData, setTableData] = useState(DEFAULT_TABLE_DATA);
    const [messageApi, contextHolder] = message.useMessage();


    const handleDetect = () => {
        const fields = detect(echo, new RegExp(delimiter), minLineCount, minFieldCount);
        if(fields.length > 0) {
            const newFieldDataSource = [];
            for(let i in fields) {
                const field = fields[i];
                newFieldDataSource.push({key: `k${i}`, name: field, matchName: field, valuePattern: '', nullable: false})
            }
            setFieldFieldTableDataSource(newFieldDataSource);
        } else {
            messageApi.info('没有识别到字段');
        }
    }

    const addIgnoreLinePattern = () => {
        if (ignoreLinePatternValue !== '' && ignoreLinePatterns.indexOf(ignoreLinePatternValue) === -1) {
            const newIgnoreLinePatterns = [...ignoreLinePatterns];
            newIgnoreLinePatterns.push(ignoreLinePatternValue);
            setIgnoreLinePatterns(newIgnoreLinePatterns);
            setIgnoreLinePatternValue('');
        }
    };
    const deleteIgnoreLinePattern = (value) => {
        setIgnoreLinePatterns(ignoreLinePatterns.filter(item => item !== value));
    }

    const renderIgnoreLinePatternItem = (value) => (
        <List.Item
            actions={[
                <Button type="link" onClick={() => deleteIgnoreLinePattern(value)}>
                    删除
                </Button>,
            ]}
        >
            {value}
        </List.Item>
    );

    const outputToJson = () => {
        const jsonConfigObj = {};
        if(activeKey === 'field') {
            if (delimiter !== DEFAULT_DELIMITER) {
                jsonConfigObj.delimiter = delimiter;
            }
            if(ignoreLinePatterns.length > 0) {
                jsonConfigObj.ignoreLinePatterns = ignoreLinePatterns;
            }
            const fields = [];
            for (let i in fieldFieldTableDataSource) {
                const row = fieldFieldTableDataSource[i];
                const field = {matchName: row.matchName, name: row.name};
                if (row.valuePattern !== '') {
                    field.valuePattern = row.valuePattern;
                }
                if(row.nullable) {
                    field.nullable = true;
                }
                fields.push(field);
            }
            jsonConfigObj.fields = fields;
        } else {

        }
        console.log(jsonConfigObj);
        setJsonConfig(JSONFormat(jsonConfigObj));
    }

    const inputFromJson = () => {

    }

    return (
        <Flex wrap="wrap" gap="middle" vertical={false}>
            {contextHolder}
            <div style={{ width: '100%'}} >
                <TextArea value = {echo}
                          onChange = {(e) => setEcho(e.target.value)}
                          autoSize={{ minRows: 10, maxRows: 15 }}
                />
            </div>
            <Divider />
            <div style={{ width: '44%'}} >
                <Tabs activeKey={activeKey} onChange={(key) => setActiveKey(key)} centered={true}>
                    <TabPane tab="字段型" key="field">
                        <Form name="fieldForm" labelAlign="left">
                            <Form.Item label="分隔符" name="delimiter"><Input defaultValue={delimiter} onChange={(e) => setDelimiter(e.target.value)}/></Form.Item>
                            <Form.Item>
                                    <Form.Item label="最小行数" name="minLineCount">
                                        <InputNumber style={{width: '50px'}} min={1} max={1000} defaultValue={minLineCount} onChange={(v) => setMinLineCount(v)}/>
                                    </Form.Item>
                                    <Form.Item label="最小字段数" name="minFieldCount">
                                        <InputNumber style={{width: '50px'}} min={1} max={1000} defaultValue={minFieldCount} onChange={(v) => setMinFieldCount(v)}/>
                                    </Form.Item>
                                    <Form.Item>
                                        <Button onClick={handleDetect}>自动识别</Button>
                                    </Form.Item>
                            </Form.Item>
                            <Form.Item>
                                <Input value={ignoreLinePatternValue} onChange={(e) => setIgnoreLinePatternValue(e.target.value)}/> <Button onClick={addIgnoreLinePattern}>忽略行</Button>
                            </Form.Item>
                            <Form.Item>
                                {ignoreLinePatterns.length > 0 && (
                                    <List
                                        size="small"
                                        bordered
                                        dataSource={ignoreLinePatterns}
                                        renderItem={renderIgnoreLinePatternItem}
                                    />
                                )}
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary">解析</Button>
                            </Form.Item>
                            <Form.Item>
                                <Button>建表语句</Button>
                            </Form.Item>
                            <Form.Item>
                                <FieldFieldTable dataSource={fieldFieldTableDataSource} setDataSource={setFieldFieldTableDataSource} />
                            </Form.Item>
                        </Form>
                    </TabPane>
                    <TabPane tab={"正则型"} key="pattern">
                        <Form name="patternForm">
                            <Form.Item label="正则" name="pattern">
                                <Input/>
                            </Form.Item>
                            <Form.Item>
                                <PatternFieldTable dataSource={patternFieldTableDataSource} setDataSource={setPatternFieldTableDataSource} />
                            </Form.Item>
                        </Form>
                    </TabPane>
                </Tabs>
            </div>
            <div style={{ width: '10%'}}>
                <br/>
                <br/>
                <br/>
                <Button onClick={outputToJson}>&gt;json</Button>
                <br/>
                <br/>
                <br/>
                <Button>&lt;json</Button>
            </div>
            <div style={{ width: '44%'}} >
                <TextArea autoSize={{ minRows: 10, maxRows: 15 }} value={jsonConfig} onChange={(e) => setJsonConfig(e.target.value)}/>
            </div>
            <Divider />
            <div>
                <Table columns={tableData.columns} dataSource={tableData.data} pagination={false} />
            </div>
        </Flex>
    );
}

export default App;