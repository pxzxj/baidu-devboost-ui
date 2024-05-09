import React, {useEffect, useRef, useState} from 'react';
import {Input, Tag, theme, Tooltip} from 'antd';
import {PlusOutlined} from "@ant-design/icons";
const tagInputStyle = {
    height: 22,
    width: 100,
    marginInlineEnd: 8,
    verticalAlign: 'top',
};
const App = (props) => {
    const { id, value, onChange, color } = props;
    const { token } = theme.useToken();
    const [inputVisible, setInputVisible] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef(null);
    useEffect(() => {
        if (inputVisible) {
            inputRef.current?.focus();
        }
    }, [inputVisible]);
    const handleClose = (removedTag) => {
        const newTags = value.filter((tag) => tag !== removedTag);
        onChange(newTags);
    };
    const showInput = () => {
        setInputVisible(true);
    };
    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };
    const handleInputConfirm = () => {
        if (inputValue && !value.includes(inputValue)) {
            onChange([...value, inputValue]);
        }
        setInputVisible(false);
        setInputValue('');
    };
    const tagPlusStyle = {
        height: 22,
        background: token.colorBgContainer,
        borderStyle: 'dashed',
    };
    return (
        <div id={id}>
            {value.map((tag, index) => {
                const isLongTag = tag.length > 20;
                const tagElem = (
                    <Tag color={color} key={index} closeIcon style={{userSelect: 'none'}} onClose={() => handleClose(tag)}>
                        {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                    </Tag>
                );
                return isLongTag ? (<Tooltip title={tag} key={tag}>{tagElem}</Tooltip>) : (tagElem);
            })}
            {inputVisible ? (
                <Input ref={inputRef} style={tagInputStyle} value={inputValue}
                       onChange={handleInputChange} onBlur={handleInputConfirm} onPressEnter={handleInputConfirm}/>
            ) : (
                <Tag style={tagPlusStyle} icon={<PlusOutlined />} onClick={showInput}>
                    &nbsp;&nbsp;&nbsp;
                </Tag>
            )}
        </div>
    );
};
export default App;