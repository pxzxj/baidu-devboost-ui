export default function doParse(echo, parseConfigurer) {
    const list = [];
    const fields = parseConfigurer.fields;
    const pattern = new RegExp(parseConfigurer.pattern, 'g');
    let match;
    while ((match = pattern.exec(echo)) !== null) {
        const map = {};
        for (let i = 0; i < fields.length; i++) {
            map[fields[i].name] = match[i + 1];
        }
        list.push(map);
    }
    return list;
}