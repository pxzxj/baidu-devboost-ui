function parseTable(echo, parseConfigurer) {
    const delimiter = parseConfigurer.delimiter;
    const lines = echo.split('\n');
    const fields = parseConfigurer.fields;

    // Construct the regular expression for the table header
    const theadPattern = fields.map(field => field.matchName).map(escapeRegexCharacter).join(delimiter);

    // Construct multiple patterns for the table body, handling nullable fields
    const tbodyPatterns = [];
    if (fields.every(field => field.valuePattern)) {
        const valuePatterns = fields.map((field, index) =>
            `(${field.valuePattern})${field.nullable ? '?' : ''}`
        );

        // Add a pattern that matches all fields
        tbodyPatterns.push(new RegExp(valuePatterns.join(delimiter)));

        // Add patterns for fewer fields if there are nullable fields at the end
        for (let i = fields.length - 1; i > 0; i--) {
            const field = fields[i];
            if (field.nullable) {
                tbodyPatterns.push(new RegExp(valuePatterns.slice(0, i).join(delimiter)));
            } else {
                break;
            }
        }
    }

    let lineInTable = false;
    const list = [];

    for (const line of lines) {
        if (line.match(theadPattern)) {
            lineInTable = true;
        } else if (lineInTable) {
            if (tbodyPatterns.length > 0) {
                lineInTable = false;
                for (let i = 0; i < tbodyPatterns.length; i++) {
                    const tbodyPattern = tbodyPatterns[i];
                    const matcher = line.match(tbodyPattern);
                    if (matcher) {
                        const map = {};
                        for (let j = 0; j < fields.length; j++) {
                            const value = (j < fields.length - i) ? matcher[j + 1] : "";
                            map[fields[j].name] = value;
                        }
                        list.push(map);
                        lineInTable = true;
                        break;
                    }
                }
            } else {
                const tokens = line.split(delimiter);
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