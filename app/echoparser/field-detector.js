export default function detect(echo, delimiter, minRowCount, minFieldCount) {
    const lines = echo.replace(/\r\n/g, '\n')
                        .split('\n')
                        .map(line =>  line.trim())
                        .filter(line => line.length > 0);
    let fields = detectTable(lines, delimiter, minRowCount, minFieldCount);
    if (fields.length === 0) {
        fields = detectKV(lines, delimiter, minFieldCount);
    }
    return fields;
}

function detectKV(lines, delimiter, minFieldCount) {
    let matchLineCount = 0;
    let fields = [];
    for (let i in lines) {
        const line = lines[i];
        const tokenArray = line.split(delimiter);
        if (tokenArray.length === 2) {
            matchLineCount++;
            fields.push(tokenArray[0]);
        } else {
            if (matchLineCount >= minFieldCount) {
                break;
            } else {
                matchLineCount = 0;
                fields = [];
            }
        }
    }
    if (matchLineCount >= minFieldCount) {
        return fields;
    } else {
        return [];
    }
}

function detectTable(lines, delimiter, minRowCount, minColumnCount) {
    let tokenCount = -1;
    let fields = [];
    let matchLineCount = 0;
    for (let line of lines) {
        let tokenArray = line.split(delimiter);
        if (tokenArray.length === tokenCount) {
            if (++matchLineCount >= minRowCount) {
                break;
            }
        }
        else if (tokenArray.length >= minColumnCount) {
            tokenCount = tokenArray.length;
            fields = tokenArray;
            matchLineCount = 0;
        }
        else {
            tokenCount = -1;
            matchLineCount = 0;
        }
    }

    if (matchLineCount >= minRowCount) {
        return fields;
    }
    else {
        return [];
    }
}

