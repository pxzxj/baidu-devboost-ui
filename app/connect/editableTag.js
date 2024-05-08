import React, { useRef, useState } from 'react';
import { Input, Tag, Tooltip } from 'antd';
const tagInputStyle = {
    width: 100,
    marginInlineEnd: 8,
    verticalAlign: 'top',
};
const App = ({tags, setTags, color}) => {
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef(null);
    const handleClose = (removedTag) => {
        const newTags = tags.filter((tag) => tag !== removedTag);
        setTags(newTags);
    };
    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };
    const handleInputConfirm = () => {
        if (inputValue && !tags.includes(inputValue)) {
            setTags([...tags, inputValue]);
        }
        setInputValue('');
    };
    return (
        <>
            {tags.map((tag, index) => {
                const isLongTag = tag.length > 20;
                const tagElem = (
                    <Tag color={color} key={index} closeIcon style={{userSelect: 'none',height: '30px', lineHeight: '30px'}} onClose={() => handleClose(tag)}>
                        {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                    </Tag>
                );
                return isLongTag ? (<Tooltip title={tag} key={tag}>{tagElem}</Tooltip>) : (tagElem);
            })}
            <Input ref={inputRef} style={tagInputStyle} value={inputValue}
                   onChange={handleInputChange} onBlur={handleInputConfirm} onPressEnter={handleInputConfirm}/>
        </>
    );
};
export default App;