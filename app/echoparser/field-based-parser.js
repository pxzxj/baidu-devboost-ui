export default function doParse(echo, parseConfigurer) {
    // Convert ignoreLinePatterns to a list of compiled regex patterns
    const ignoreLinePatterns = parseConfigurer.ignoreLinePatterns.map(pattern => new RegExp(pattern));

    // Process the echo string
    echo = echo.replace('\r\n', '\n').split('\n')
        .map(line => line.trim())
        .filter(line => line !== '')
        .filter(line => !ignoreLinePatterns.some(pattern => pattern.test(line)))
        .join('\n');

    let list = parseTable(echo, parseConfigurer);
    if (list.length === 0) {
        list = parseKV(echo, parseConfigurer);
    }
    return list;
}

function parseTable(echo, parseConfigurer) {
    const delimiter = parseConfigurer.delimiter;
    const lines = echo.split('\n');
    const fields = parseConfigurer.fields;

    let theadPattern = fields.map(field => field.matchName).map(escapeRegexCharacter).join(delimiter);
    theadPattern = new RegExp(`^${theadPattern}$`)

    const tbodyPatterns = [];
    if (fields.every(field => field.valuePattern)) {
        const valuePatterns = fields.map((field, index) =>
            `(${field.valuePattern})${field.nullable ? '?' : ''}`
        );

        tbodyPatterns.push(new RegExp(`^${valuePatterns.join(delimiter)}$`));

        for (let i = fields.length - 1; i > 0; i--) {
            const field = fields[i];
            if (field.nullable) {
                tbodyPatterns.push(new RegExp(`^${valuePatterns.slice(0, i).join(delimiter)}$`));
            } else {
                break;
            }
        }
    }

    let lineInTable = false;
    const list = [];

    for (const line of lines) {
        if (theadPattern.test(line)) {
            lineInTable = true;
            console.log('匹配到头');
        } else if (lineInTable) {
            console.log(tbodyPatterns);
            if (tbodyPatterns.length > 0) {
                lineInTable = false;
                for (let i = 0; i < tbodyPatterns.length; i++) {
                    const tbodyPattern = tbodyPatterns[i];
                    const matcher = line.match(tbodyPattern);
                    if (matcher) {
                        const map = {};
                        for (let j = 0; j < fields.length; j++) {
                            map[fields[j].name] = (j < fields.length - i) ? matcher[j + 1] : "";
                        }
                        list.push(map);
                        lineInTable = true;
                        break;
                    }
                }
            } else {
                const tokens = line.split(new RegExp(delimiter));
                if (tokens.length === fields.length) {
                    const map = {};
                    for (let i = 0; i < tokens.length; i++) {
                        map[fields[i].name] = tokens[i];
                    }
                    list.push(map);
                } else {
                    lineInTable = false;
                }
            }
        }
    }

    return list;
}


function parseKV(echo, parseConfigurer) {
    const fields = parseConfigurer.fields;
    const lines = echo.split('\n');
    const list = [];

    for (let i = 0; i + fields.length - 1 < lines.length; i++) {
        let match = true;
        const map = {};

        for (let j = 0; j < fields.length; j++) {
            const fieldName = fields[j].name;
            const matchName = fields[j].matchName;
            const delimiter = parseConfigurer.delimiter;

            let value = lines[i + j].replace(new RegExp(`^${matchName}${delimiter}`), '');

            if (lines[i + j] !== value) {
                map[fieldName] = value;
            } else {
                match = false;
                break;
            }
        }

        if (match) {
            list.push(map);
            break;
        }
    }
    return list;
}


function escapeRegexCharacter(regex) {
    return regex.replace("(", "\\(").replace(")", "\\)");
}