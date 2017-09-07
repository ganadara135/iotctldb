UPDATE
	_cub_schema_comments
SET
	description = '사용자 테이블',
	last_updated = CURRENT_TIMESTAMP,
	last_updated_user = CURRENT_USER
WHERE
	LOWER(table_name) = 'user'
	AND LOWER(column_name) = '*';
UPDATE
	_cub_schema_comments
SET
	description = '장치 테이블',
	last_updated = CURRENT_TIMESTAMP,
	last_updated_user = CURRENT_USER
WHERE
	LOWER(table_name) = 'device'
	AND LOWER(column_name) = '*';
UPDATE
	_cub_schema_comments
SET
	description = '통신가능여부',
	last_updated = CURRENT_TIMESTAMP,
	last_updated_user = CURRENT_USER
WHERE
	LOWER(table_name) = 'device'
	AND LOWER(column_name) = 'teleport';
