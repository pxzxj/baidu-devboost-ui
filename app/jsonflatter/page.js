'use client'

import { React, useState } from 'react';
import { DownOutlined } from '@ant-design/icons';
import {Button, Flex, Input, Tree, Space, Table, Tag, Dropdown, Menu, Switch, Divider} from 'antd';

import JSONFormat from 'json-format';

import { BsBraces } from "react-icons/bs";
import { BiBracket } from "react-icons/bi";

const DEFAULT_TABLE_DATA = {
    columns: [{title: 'Name', dataIndex: 'name'}],
    data: [{key: '1', name: 'Josh Long'}]
}

function App() {

    const { TextArea } = Input;

    const [jsonText, setJsonText] = useState('');
    const [treeData, setTreeData] = useState([{title: 'ROOT', key: 'ROOT', path: ''}]);
    const [tableData, setTableData] = useState(DEFAULT_TABLE_DATA);
    const [flatCfgObj, setFlatCfgObj] = useState({ignoreFields: [], flatFields: [], joinFields: [], mergeFields: [], camelToUnderscore: true});

    const flatCfgStr = JSONFormat(flatCfgObj);
    const items = [
        {
            key: 'setRoot',
            label: 'Set as rootField',
        },
        {
            key: 'ignoreField',
            label: 'IgnoreField',
        },
        {
            key: 'mergeField',
            label: 'MergeField'
        },
        {
            key: 'flatField',
            label: 'FlatField'
        },
        {
            key: 'joinField',
            label: 'JoinField'
        },
        {
            key: 'unIgnoreField',
            label: 'UnIgnoreField',
        },
        {
            key: 'unMergeField',
            label: 'UnMergeField'
        },
        {
            key: 'unFlatField',
            label: 'UnFlatField'
        },
        {
            key: 'unJoinField',
            label: 'UnJoinField'
        }
    ];

    const titleRender = (nodeData) => {
        const onClick = ({ key }) => {
            const path = nodeData.path;
            const {...flatCfgObjCopy} = flatCfgObj;
            switch (key) {
                case 'setRoot' :
                    flatCfgObjCopy.rootField = path;
                    break;
                case 'ignoreField':
                    flatCfgObjCopy.ignoreFields.push(path);
                    break;
                case 'mergeField':
                    flatCfgObjCopy.mergeFields.push(path);
                    break;
                case 'flatField':
                    flatCfgObjCopy.flatFields.push(path);
                    break;
                case 'joinField':
                    flatCfgObjCopy.joinFields.push(path);
                    break;
                case 'unIgnoreField':
                    const index1 = flatCfgObjCopy.ignoreFields.indexOf(path);
                    if (index1 != -1) {
                        flatCfgObjCopy.ignoreFields.splice(index1, 1);
                    }
                    break;
                case 'unMergeField':
                    const index2 = flatCfgObjCopy.mergeFields.indexOf(path);
                    if (index2 != -1) {
                        flatCfgObjCopy.mergeFields.splice(index2, 1);
                    }
                    break;
                case 'unFlatField':
                    const index3 = flatCfgObjCopy.flatFields.indexOf(path);
                    if (index3 != -1) {
                        flatCfgObjCopy.flatFields.splice(index3, 1);
                    }
                    break;
                case 'unJoinField':
                    const index4 = flatCfgObjCopy.joinFields.indexOf(path);
                    if (index4 != -1) {
                        flatCfgObjCopy.joinFields.splice(index4, 1);
                    }
                    break;
                default :
            }
            setFlatCfgObj(flatCfgObjCopy);
        };
        return (
            <Dropdown menu={{
                items, onClick
            }} trigger={['contextMenu']}>
                <span>{nodeData.title}</span>
            </Dropdown>
        );
    };

    const setCamelToUnderline = (value) => {
        const {...flatCfgObjCopy} = flatCfgObj;
        flatCfgObjCopy.camelToUnderscore = value;
        setFlatCfgObj(flatCfgObjCopy);
    }
    return (
        <Flex wrap="wrap" gap="middle" vertical={false}>
            <div style={{ width: '33%'}} >
                <TextArea value = {jsonText}
                          onChange = {(e) => setJsonText(e.target.value)}
                          onBlur = {() => setTreeData(calculateTreeData(jsonText))}
                          autoSize={{ minRows: 10, maxRows: 15 }}
                />
            </div>
            <div style={{ width: '30%'}} >
                <Tree
                    showIcon
                    defaultExpandAll
                    titleRender={titleRender}
                    switcherIcon={<DownOutlined />}
                    treeData={treeData}
                />
            </div>
            <div style={{ width: '33%'}} >
                <TextArea value = {flatCfgStr} autoSize={{ minRows: 9, maxRows: 15 }}/>
                <Divider />
                <Space>
                    <span>camelToUnderscore</span>
                    <Switch defaultChecked onChange={setCamelToUnderline}/>
                    <Button type="primary" danger onClick={() => {
                        setFlatCfgObj({ignoreFields: [], flatFields: [], joinFields: [], mergeFields: [], camelToUnderscore: true});
                    }}>Reset</Button>
                    <Button type="primary" onClick={() => {setTableData(flat(jsonText, flatCfgObj))}}>Flat</Button>
                </Space>
            </div>
            <div>
                <Table columns={tableData.columns} dataSource={tableData.data} pagination={false} />
            </div>
        </Flex>
    );
}

function calculateTreeData(jsonText) {
    let jsonObj = null;
    try {
        jsonObj = JSON.parse(jsonText);
    } catch (e) {

    }
    if (jsonObj == null) {
        alert('illegal json');
        return [{title: 'ROOT', key: 'ROOT', path: ''}];
    }
    let treeData  = [{title: 'ROOT', key: 'ROOT', path: ''}];
    traverseJsonObj(jsonObj, treeData[0], 'ROOT', '');
    return treeData;
}

/**
 *
 * @param jsonObj
 * @param treeObj
 * @param path 包含数组索引的路径
 * @param nodePath 不包含数组索引的路径
 */
function traverseJsonObj(jsonObj, treeObj, path, nodePath) {
    if (jsonObj instanceof Array) {
        treeObj.icon = <BiBracket />
        if(jsonObj.length > 0){
            let children = [];
            for (let idx in jsonObj) {
                let idxPath = path + '.' + idx;
                let child = {title: idx.toString(), key: idxPath, path: nodePath};
                traverseJsonObj(jsonObj[idx], child, idxPath, nodePath);
                children.push(child);
            }
            treeObj.children = children;
        }
    } else if (jsonObj instanceof Object) {
        treeObj.icon = <BsBraces />
        let children = [];
        for (let key in jsonObj) {
            let keyPath = path + '.' + key;
            let objNodePath = nodePath;
            if (objNodePath != '') {
                objNodePath += '.';
            }
            objNodePath += key;
            let child = {title: key, key: keyPath, path: objNodePath};
            traverseJsonObj(jsonObj[key], child, keyPath, objNodePath);
            children.push(child);
        }
        if (children.length > 0) {
            treeObj.children = children;
        }
    } else {
        if (jsonObj != null && (typeof jsonObj) == 'string') {
            jsonObj = '"' + jsonObj + '"';
        }
        treeObj.title += ': ' + jsonObj;
    }
}

function flat(jsonStr, flatConfigurer) {
    let rootNode = JSON.parse(jsonStr);
    let rootFieldPaths = [];
    let flatValues = [];
    if (flatConfigurer.rootField != '' && flatConfigurer.rootField != null && flatConfigurer.rootField != undefined) {
        rootFieldPaths = flatConfigurer.rootField.split('.');
    }
    try{
        traverse(rootNode, '', rootFieldPaths, flatValues, {}, flatConfigurer);
    }catch (error) {
        console.error('捕获到异常：', error);
    }
    if (flatConfigurer.camelToUnderscore) {
        let ctuValues = [];
        for (let i = 0; i < flatValues.length; i++) {
            let flatValue = flatValues[i];
            let ctuValue = {};
            for (let key in flatValue) {
                ctuValue[camelToUnderscore(key)] = flatValue[key];
            }
            ctuValues.push(ctuValue);
        }
        flatValues = ctuValues;
    }
    let tableData = DEFAULT_TABLE_DATA;
    if (flatValues.length > 0) {
        let columns = [];
        let columnNames = [];
        for (let i in flatValues) {
            const flatValue = flatValues[i];
            for (let key in flatValue) {
                if(columnNames.indexOf(key) === -1) {
                    columnNames.push(key);
                    columns.push({title: key, dataIndex: key});
                }
            }
            flatValue['key'] = i.toString();
        }
        tableData = {columns: columns, data: flatValues};
    }
    return tableData;
}

function traverse(jsonNode, path, rootFieldPaths, flatValues, mergeFieldValueMap, flatConfigurer) {
    if (rootFieldPaths.length == 0) {
        if (jsonNode instanceof Array) {
            for (let i in jsonNode) {
                let inode = jsonNode[i];
                traverse(inode, path, rootFieldPaths, flatValues, mergeFieldValueMap, flatConfigurer);
            }
        } else if (jsonNode instanceof Object) {
            let map = {};
            for (let fieldName in jsonNode) {
                let fieldPath = fieldName;
                if (path != '') {
                    fieldPath = path + '.' + fieldName;
                }
                flatNodeValues(jsonNode[fieldName], fieldPath, map, flatConfigurer);
            }
            for (let key in mergeFieldValueMap) {
                map[key] = mergeFieldValueMap[key];
            }
            flatValues.push(map);
        } else {
            let map = {};
            flatNodeValues(jsonNode, path, map, flatConfigurer);
            for (let key in mergeFieldValueMap) {
                map[key] = mergeFieldValueMap[key];
            }
            flatValues.push(map);
        }
    } else {
        if (jsonNode instanceof Array) {
            for (let i in jsonNode) {
                let inode = jsonNode[i];
                let {...map} = mergeFieldValueMap;
                traverse(inode, path, rootFieldPaths, flatValues, map, flatConfigurer);
            }
        } else if (jsonNode instanceof Object) {
            mergeFieldValues(path, rootFieldPaths[0], mergeFieldValueMap, jsonNode, flatConfigurer);
            let nextNode = jsonNode[rootFieldPaths[0]];
            if (path != '') {
                path += '.' + rootFieldPaths[0];
            } else {
                path += rootFieldPaths[0];
            }
            if (nextNode != undefined) {
                traverse(nextNode, path, rootFieldPaths.slice(1, rootFieldPaths.length), flatValues, mergeFieldValueMap, flatConfigurer);
            } else {
                alert("jsonNode not found for path " + path);
            }
        } else {
            alert("traverse end, cause " + path + " is not array or object!");
        }
    }
}

function flatNodeValues(jsonNode, path, valueMap, flatConfigurer) {
    let ignoreFields = flatConfigurer.ignoreFields;
    let flatFields = flatConfigurer.flatFields;
    let joinFields = flatConfigurer.joinFields;
    if (ignoreFields.includes(path)) {
        return;
    }
    if (jsonNode instanceof Array) {
        if (joinFields.includes(path)) {
            if (jsonNode.length > 0) {
                let firstNode = jsonNode[0];
                if (firstNode instanceof Object) {
                    let values = [];
                    const keys = new Set();
                    for (let i in jsonNode) {
                        let inode = jsonNode[i];
                        const map = {};
                        flatNodeValues(inode, path, map, flatConfigurer);
                        values.push(map);
                        for (let key in map) {
                            keys.add(key);
                        }
                    }
                    for (let key of keys) {
                        valueMap[key] = values.map(m => m[key]).filter(v => v != null).join(', ');
                    }
                } else {
                    let values = [];
                    for (let i in jsonNode) {
                        let inode = jsonNode[i];
                        let map = {};
                        flatNodeValues(inode, path, map, flatConfigurer);
                        for (let key in map) {
                            values.push(map[key]);
                        }
                    }
                    valueMap[path] = values.join(', ');
                }
            }
        } else {
            alert(path + " node type is array, it must be ignore or join");
            throw new Error(path + " node type is array, it must be ignore or join");
        }
    } else if (jsonNode instanceof Object) {
        if (flatFields.includes(path)) {
            for (let key in jsonNode) {
                flatNodeValues(jsonNode[key], path + '.' + key, valueMap, flatConfigurer);
            }
        } else {
            alert(path + " node type is object, it must be ignore or flat");
            throw new Error(path + " node type is object, it must be ignore or flat");
        }
    } else {
        valueMap[path] = jsonNode;
    }
}

function mergeFieldValues(path, nextRootFieldName, mergeFieldValueMap, jsonNode, flatConfigurer) {
    const mergeFields = flatConfigurer.mergeFields;
    for (let i in mergeFields) {
        const mergeField = mergeFields[i];
        if (!mergeField.startsWith(path)) {
            continue;
        }
        let nextMergeFieldName;
        let nextDotIndex;
        if (path != '') {
            nextDotIndex = mergeField.indexOf('.', path.length + 1);
            if (nextDotIndex != -1) {
                nextMergeFieldName = mergeField.substring(path.length + 1, nextDotIndex);
            } else {
                nextMergeFieldName = mergeField.substring(path.length + 1);
            }
        } else {
            nextDotIndex = mergeField.indexOf('.');
            if (nextDotIndex != -1) {
                nextMergeFieldName = mergeField.substring(0, nextDotIndex);
            } else {
                nextMergeFieldName = mergeField;
            }
        }
        if (nextMergeFieldName != nextRootFieldName) {
            const mergeFlatValues = [];
            let mergeFieldNode = jsonNode[nextMergeFieldName];
            let mergeFieldPaths = [];
            if (nextDotIndex != -1) {
                mergeFieldPaths = mergeField.substring(nextDotIndex + 1).split('.');
            }
            let mergePath = path + '.' + nextMergeFieldName;
            if (path == '') {
                mergePath = nextMergeFieldName;
            }
            if (mergeFieldNode != undefined) {
                traverse(mergeFieldNode, mergePath, mergeFieldPaths, mergeFlatValues, {}, flatConfigurer);
                if (mergeFlatValues.length == 1) {
                    const mergeFlatValue = mergeFlatValues[0];
                    for (let key in mergeFlatValue) {
                        mergeFieldValueMap[key] = mergeFlatValue[key];
                    }
                } else {
                    alert("merge field " + mergedPath + " cannot have multiple values!");
                    throw new Error("merge field " + mergedPath + " cannot have multiple values!");
                }
            } else {
                alert("merge field " + mergedPath + " not found!");
            }
        }
    }
}

function camelToUnderscore(str) {
    let result = str.charAt(0);
    for (let i = 1; i < str.length - 1; i++) {
        if (isUnderscoreRequired(str.charAt(i - 1), str.charAt(i), str.charAt(i + 1))) {
            result += '_';
        }
        result += str.charAt(i);
    }
    result += str.charAt(str.length - 1);
    result = result.toLowerCase().replaceAll('\.', '_');
    return result;
}

function isUnderscoreRequired(before, current, after) {
    return /[a-z]/.test(before) && /[A-Z]/.test(current) && /[a-z]/.test(after);
}


export default App;
