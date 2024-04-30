import React, { useContext, useEffect, useRef, useState } from 'react';
import {Button, Form, Input, message, Space, Switch, Table} from 'antd';
const EditableContext = React.createContext(null);
const EditableRow = ({ index, ...props }) => {
    const [form] = Form.useForm();
    return (
        <Form form={form} component={false}>
            <EditableContext.Provider value={form}>
                <tr {...props} />
            </EditableContext.Provider>
        </Form>
    );
};
const EditableCell = ({
                          title,
                          editable,
                          children,
                          dataIndex,
                          record,
                          handleSave,
                          ...restProps
                      }) => {
    const [editing, setEditing] = useState(false);
    const inputRef = useRef(null);
    const form = useContext(EditableContext);
    useEffect(() => {
        if (editing) {
            inputRef.current?.focus();
        }
    }, [editing]);
    const toggleEdit = () => {
        setEditing(!editing);
        form.setFieldsValue({
            [dataIndex]: record[dataIndex],
        });
    };
    const save = async () => {
        try {
            const values = await form.validateFields();
            toggleEdit();
            handleSave({
                ...record,
                ...values,
            });
        } catch (errInfo) {
            console.log('Save failed:', errInfo);
        }
    };
    let childNode = children;
    if (editable) {
        childNode = editing ? (
            <Form.Item style={{margin: 0,}} name={dataIndex}>
                <Input ref={inputRef} onPressEnter={save} onBlur={save} />
            </Form.Item>
        ) : (
            <div
                className="editable-cell-value-wrap"
                style={{
                    paddingRight: 24,
                }}
                onClick={toggleEdit}
            >
                <Space>{children}</Space>
            </div>
        );
    }
    return <td {...restProps}>{childNode}</td>;
};
const App = ({dataSource, setDataSource}) => {
    const [count, setCount] = useState(2);
    const [messageApi, contextHolder] = message.useMessage();
    const handleDelete = (key) => {
        console.log(dataSource);
        console.log(key);
        if(dataSource.length > 1) {
            const newData = dataSource.filter((item) => item.key !== key);
            setDataSource(newData);
        } else {
            messageApi.open({
                type: 'warning',
                content: '至少需要一个字段'
            });
        }
    };
    const handleInsert = (key) => {
        console.log('count:' + count);
        const newData = {
            key: count,
            name: '',
            matchName: '',
            valuePattern: '',
            nullable: false,
        };
        const newDatasource = [...dataSource];
        const index = newDatasource.findIndex((item) => key === item.key);
        newDatasource.splice(index + 1, 0, newData);
        setDataSource(newDatasource);
        setCount(count + 1);
    }
    const handleSwitchChange = (row, checked) => {
        row.nullable = checked;
        const newData = [...dataSource];
        const index = newData.findIndex((item) => row.key === item.key);
        const item = newData[index];
        newData.splice(index, 1, {
            ...item,
            ...row,
        });
        setDataSource(newData);
    };
    const defaultColumns = [
        {
            title: 'matchName',
            dataIndex: 'matchName',
            editable: true,
        },
        {
            title: 'name',
            dataIndex: 'name',
            editable: true,
        },
        {
            title: 'valuePattern',
            dataIndex: 'valuePattern',
            editable: true,
        },
        {
            title: 'nullable',
            dataIndex: 'nullable',
            render: (isActive, record) => (
                <Switch checked={isActive} onChange={changed => handleSwitchChange(record, changed)} />
            ),
        },
        {
            title: 'operation',
            dataIndex: 'operation',
            render: (_, record) =>
                dataSource.length >= 1 ? (
                    <>
                        <Button onClick={() => handleDelete(record.key)}>Delete</Button>
                        <Button onClick={() => handleInsert(record.key)}>Add</Button>
                    </>
                ) : null,
        },
    ];
    const handleSave = (row) => {
        const newData = [...dataSource];
        const index = newData.findIndex((item) => row.key === item.key);
        const item = newData[index];
        newData.splice(index, 1, {
            ...item,
            ...row,
        });
        setDataSource(newData);
    };
    const components = {
        body: {
            row: EditableRow,
            cell: EditableCell,
        },
    };
    const columns = defaultColumns.map((col) => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: (record) => ({
                record,
                editable: col.editable,
                dataIndex: col.dataIndex,
                title: col.title,
                handleSave,
            }),
        };
    });
    return (
        <div>
            {contextHolder}
            <Table
                components={components}
                rowClassName={() => 'editable-row'}
                bordered
                dataSource={dataSource}
                columns={columns}
                pagination={false}
            />
        </div>
    );
};
export default App;