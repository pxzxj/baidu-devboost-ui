'use client'

import {Button, Divider, Flex, Form, Input, InputNumber, List, message, Popover, Table, Tabs} from "antd";
import {React, useState, useRef} from "react";
import PatternFieldTable from './fieldsTable4typepattern';
import FieldFieldTable from './fieldsTable4typefield';
import detect from './field-detector';
import doParseField from './field-based-parser';
import doParsePattern from './pattern-based-parser';

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
    const [fieldFieldTableDataSource, setFieldFieldTableDataSource] = useState([{
        key: '0',
        name: '',
        matchName: '',
        valuePattern: '',
        nullable: false,
    }]);
    const [pattern, setPattern] = useState('');
    const [patternFieldTableDataSource, setPatternFieldTableDataSource] = useState([{key: '0', 'name': ''}]);
    const [jsonConfig, setJsonConfig] = useState('');
    const [tableData, setTableData] = useState(DEFAULT_TABLE_DATA);
    const [messageApi, contextHolder] = message.useMessage();
    const tableDataAnchorRef = useRef(null);

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
            jsonConfigObj.pattern = pattern;
            const fields = [];
            for (let i in patternFieldTableDataSource) {
                fields.push({name: patternFieldTableDataSource[i].name});
            }
            jsonConfigObj.fields = fields;
        }
        setJsonConfig(JSONFormat(jsonConfigObj));
    }

    const inputFromJson = () => {
        let jsonConfigObj = null;
        try {
            jsonConfigObj = JSON.parse(jsonConfig);
        } catch (e) {

        }
        if (jsonConfigObj != null && jsonConfigObj.fields) {
            if (jsonConfigObj.pattern) {
                setActiveKey('pattern');
                setPattern(jsonConfigObj.pattern);
                for (let i in jsonConfigObj.fields) {
                    const field = jsonConfigObj.fields[i];
                    field.key = i + '';
                }
                setPatternFieldTableDataSource(jsonConfigObj.fields);
            } else {
                setActiveKey('field');
                if (jsonConfigObj.delimiter) {
                    setDelimiter(jsonConfigObj.delimiter);
                }
                if (jsonConfigObj.ignoreLinePatterns) {
                    setIgnoreLinePatterns(jsonConfigObj.ignoreLinePatterns);
                }
                for (let i in jsonConfigObj.fields) {
                    const field = jsonConfigObj.fields[i];
                    field.key = i + '';
                    if(!field.valuePattern) {
                        field.valuePattern = '';
                    }
                    if (!field.nullable) {
                        field.nullable = false;
                    }
                }
                setFieldFieldTableDataSource(jsonConfigObj.fields);
            }
        } else {
            messageApi.open({
                type: 'error',
                content: '非法解析配置'
            });
        }
    }

    const parseField = () => {
        if(fieldFieldTableDataSource.length === 1 && fieldFieldTableDataSource[0].matchName === '') {
            messageApi.info('请先输入解析字段信息');
            return;
        }
        const jsonConfigObj = {};
        jsonConfigObj.delimiter = delimiter;
        jsonConfigObj.ignoreLinePatterns = ignoreLinePatterns;
        const fields = [];
        const columns = [{title: '序号', dataIndex: 'qwerty_seq'}];
        for (let i in fieldFieldTableDataSource) {
            const row = fieldFieldTableDataSource[i];
            const field = {matchName: row.matchName, name: row.name};
            if (row.valuePattern !== '') {
                field.valuePattern = row.valuePattern;
            }
            field.nullable = row.nullable;
            fields.push(field);
            columns.push({title: row.name, dataIndex: row.name});
        }
        jsonConfigObj.fields = fields;
        const parseResult = doParseField(echo, jsonConfigObj);
        for (let i in parseResult) {
            parseResult[i]['key'] = i + '';
            parseResult[i]['qwerty_seq'] = i + '';
        }
        const newTableData = {columns: columns, data: parseResult}
        setTableData(newTableData);
        if (tableDataAnchorRef.current) {
            tableDataAnchorRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }

    const parsePattern = () => {
        if(pattern === '') {
            messageApi.info('正则不能为空');
            return;
        }
        if(patternFieldTableDataSource.length === 1 && patternFieldTableDataSource[0].name === '') {
            messageApi.info('请先输入解析字段信息');
            return;
        }
        const jsonConfigObj = {};
        jsonConfigObj.pattern = pattern;
        jsonConfigObj.fields = patternFieldTableDataSource;
        const parseResult = doParsePattern(echo, jsonConfigObj);
        const columns = [{title: '序号', dataIndex: 'qwerty_seq'}];
        for (let i in patternFieldTableDataSource) {
            const row = patternFieldTableDataSource[i];
            columns.push({title: row.name, dataIndex: row.name});
        }
        for (let i in parseResult) {
            parseResult[i]['key'] = i + '';
            parseResult[i]['qwerty_seq'] = i + '';
        }
        const newTableData = {columns: columns, data: parseResult}
        setTableData(newTableData);
        if (tableDataAnchorRef.current) {
            tableDataAnchorRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }

    const buildSchema = () => {
        let sql = 'create table MY_TABLE(\r\n id integer auto_increment primary key,\r\n';
        let columns = fieldFieldTableDataSource;
        if(activeKey === 'pattern') {
            columns = patternFieldTableDataSource;
        }
        for (let i in columns) {
            sql += columns[i].name + ' varchar(200),\r\n';
        }
        sql += 'check_device_id integer,\r\ndevice_id integer,\r\ncollect_finish_time datetime\r\n);\r\n'
        return (<TextArea value = {sql} autoSize={{maxRows: 15 }} />)
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
                            <Form.Item label="分隔符" name="delimiter"><Input style={{width: '150px'}} defaultValue={delimiter} onChange={(e) => setDelimiter(e.target.value)}/></Form.Item>
                            <Form.Item>
                                最小行数：&nbsp;
                                        <InputNumber style={{width: '50px'}} min={1} max={1000} defaultValue={minLineCount} onChange={(v) => setMinLineCount(v)}/>
                                最小字段数：&nbsp;
                                        <InputNumber style={{width: '50px'}} min={1} max={1000} defaultValue={minFieldCount} onChange={(v) => setMinFieldCount(v)}/>
                                &nbsp;
                                        <Button onClick={handleDetect}>自动识别</Button>
                            </Form.Item>
                            <Form.Item>
                                <Input style={{width: '200px'}} value={ignoreLinePatternValue} onChange={(e) => setIgnoreLinePatternValue(e.target.value)}/> <Button onClick={addIgnoreLinePattern}>忽略行</Button>
                            </Form.Item>
                                {ignoreLinePatterns.length > 0 && (
                                    <Form.Item>
                                    <List
                                        size="small"
                                        bordered
                                        dataSource={ignoreLinePatterns}
                                        renderItem={renderIgnoreLinePatternItem}
                                    />
                                    </Form.Item>
                                )}
                            <Form.Item>
                                <Button type="primary" onClick={parseField}>解析</Button>
                                &nbsp;
                                <Popover overlayInnerStyle={{width: '400px'}} content={buildSchema()} title="Schema" trigger="click">
                                    <Button>建表语句</Button>
                                </Popover>
                            </Form.Item>
                            <Form.Item>
                                <FieldFieldTable dataSource={fieldFieldTableDataSource} setDataSource={setFieldFieldTableDataSource} />
                            </Form.Item>
                        </Form>
                    </TabPane>
                    <TabPane tab={"正则型"} key="pattern">
                        <Form name="patternForm">
                            <Form.Item label="正则" name="pattern">
                                <Input value={pattern} onChange={(e) => setPattern(e.target.value)}/>
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" onClick={parsePattern}>解析</Button>
                                &nbsp;
                                <Popover overlayInnerStyle={{width: '400px'}} content={buildSchema()} title="Schema" trigger="click">
                                    <Button>建表语句</Button>
                                </Popover>
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
                <Button onClick={inputFromJson}>&lt;json</Button>
            </div>
            <div style={{ width: '44%'}} >
                <TextArea autoSize={{ minRows: 10, maxRows: 15 }} value={jsonConfig} onChange={(e) => setJsonConfig(e.target.value)}/>
            </div>
            <Divider />
            <div id="fieldTableDiv" ref={tableDataAnchorRef}>
                <Table columns={tableData.columns} dataSource={tableData.data} pagination={false} />
            </div>
        </Flex>
    );
}

export default App;