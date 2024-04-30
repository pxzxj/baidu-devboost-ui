package com.ponshine.bureaudata.parse;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.Assert;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

class FieldBasedParser implements Parser {

	private final Logger logger = LoggerFactory.getLogger(FieldBasedParser.class);

	@Override
	public boolean supports(ParseConfigurer parseConfigurer) {
		return !StringUtils.hasText(parseConfigurer.getScript()) && !StringUtils.hasText(parseConfigurer.getPattern());
	}

	@Override
	public List<Map<String, Object>> doParse(String echo, ParseConfigurer parseConfigurer) {
		List<Pattern> ignoreLinePatterns = parseConfigurer.getIgnoreLinePatterns().stream()
				.map(Pattern::compile).collect(Collectors.toList());
		echo = Arrays.stream(echo.replace("\r\n", "\n")
						.split("\n"))
				.map(StringUtils::trimWhitespace)
				.filter(StringUtils::hasText)
				.filter(line -> ignoreLinePatterns.stream().noneMatch(pattern -> pattern.matcher(line).find()))
				.collect(Collectors.joining("\n"));
		if (CollectionUtils.isEmpty(parseConfigurer.getFields())) {
			List<String> fieldNames = FieldDetector.detect(echo, parseConfigurer.getDelimiter());
			logger.info("detected fieldNames: {}", fieldNames);
			if (fieldNames.isEmpty()) {
				return Collections.emptyList();
			}
			List<Field> fields = new ArrayList<>();
			for (String fieldName : fieldNames) {
				Field field = new Field();
				field.setName(fieldName);
				field.setMatchName(fieldName);
				fields.add(field);
			}
			parseConfigurer.setFields(fields);
		}
		Assert.isTrue(parseConfigurer.getFields().stream()
				.allMatch(field -> StringUtils.hasText(field.getName()) && StringUtils.hasText(field.getMatchName())), "name and matchName cannot be empty!");
		List<Map<String, Object>> list = parseTable(echo, parseConfigurer);
		if (list.isEmpty()) {
			list = parseKV(echo, parseConfigurer);
		}
		return list;
	}

	private List<Map<String, Object>> parseTable(String echo, ParseConfigurer parseConfigurer) {
		String delimiter = parseConfigurer.getDelimiter();
		String[] lines = echo.split("\n");
		List<Field> fields = parseConfigurer.getFields();
		String theadPattern = fields.stream().map(Field::getMatchName).map(this::escapeRegexCharacter)
				.collect(Collectors.joining(delimiter));
		//末尾一个或多个字段为空时直接使用所有字段生成的正则无法匹配到(因为末尾字段值为空的时候分隔符可能也匹配不到了)，因此根据末尾空字段数量构造多个正则
		List<Pattern> tbodyPatterns = new ArrayList<>();
		if (fields.stream().allMatch(field -> StringUtils.hasText(field.getValuePattern()))) {
			List<String> valuePatterns = fields.stream()
					.map(field -> "(" + field.getValuePattern() + ")" + (field.isNullable() ? "?" : ""))
					.collect(Collectors.toList());
			tbodyPatterns.add(Pattern.compile(StringUtils.collectionToDelimitedString(valuePatterns, delimiter)));
			for (int i = fields.size() - 1; i > 0; i--) {
				Field field = fields.get(i);
				if (field.isNullable()) {
					tbodyPatterns.add(Pattern.compile(StringUtils.collectionToDelimitedString(valuePatterns.subList(0, i), delimiter)));
				}
				else {
					break;
				}
			}
		}
		boolean lineInTable = false;
		List<Map<String, Object>> list = new ArrayList<>();
		for (String line : lines) {
			if (line.matches(theadPattern)) {
				lineInTable = true;
			}
			else if (lineInTable) {
				if (!tbodyPatterns.isEmpty()) {
					lineInTable = false;
					for (int i = 0; i < tbodyPatterns.size(); i++) {
						Pattern tbodyPattern = tbodyPatterns.get(i);
						Matcher matcher = tbodyPattern.matcher(line);
						if (matcher.find()) {
							Map<String, Object> map = new LinkedHashMap<>();
							for (int j = 0; j < fields.size(); j++) {
								String value = (j < fields.size() - i) ? matcher.group(j + 1) : "";
								map.put(fields.get(j).getName(), value);
							}
							list.add(map);
							lineInTable = true;
							break;
						}
					}

				}
				else {
					String[] tokens = line.split(delimiter);
					if (tokens.length == fields.size()) {
						Map<String, Object> map = new LinkedHashMap<>();
						for (int i = 0; i < tokens.length; i++) {
							map.put(fields.get(i).getName(), tokens[i]);
						}
						list.add(map);
					}
					else {
						lineInTable = false;
					}
				}
			}
		}
		return list;
	}

	private List<Map<String, Object>> parseKV(String echo, ParseConfigurer parseConfigurer) {
		List<Field> fields = parseConfigurer.getFields();
		String[] lines = echo.split("\n");
		List<Map<String, Object>> list = new ArrayList<>();
		for (int i = 0; i + fields.size() - 1 < lines.length; i++) {
			boolean match = true;
			Map<String, Object> map = new LinkedHashMap<>();
			for (int j = 0; j < fields.size(); j++) {
				String value = lines[i + j].replaceFirst(fields.get(j)
						.getMatchName() + parseConfigurer.getDelimiter(), "");
				if (!lines[i + j].equals(value)) {
					map.put(fields.get(j).getName(), value);
				}
				else {
					match = false;
					break;
				}
			}
			if (match) {
				list.add(map);
				break;
			}
		}
		return list;
	}

	private String escapeRegexCharacter(String regex) {
		return regex.replace("(", "\\(").replace(")", "\\)");
	}

}
