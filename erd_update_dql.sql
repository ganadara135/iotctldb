UPDATE
	_cub_schema_comments
SET
	description = '����� ���̺�',
	last_updated = CURRENT_TIMESTAMP,
	last_updated_user = CURRENT_USER
WHERE
	LOWER(table_name) = 'user'
	AND LOWER(column_name) = '*';
UPDATE
	_cub_schema_comments
SET
	description = '��ġ ���̺�',
	last_updated = CURRENT_TIMESTAMP,
	last_updated_user = CURRENT_USER
WHERE
	LOWER(table_name) = 'device'
	AND LOWER(column_name) = '*';
UPDATE
	_cub_schema_comments
SET
	description = '��Ű��ɿ���',
	last_updated = CURRENT_TIMESTAMP,
	last_updated_user = CURRENT_USER
WHERE
	LOWER(table_name) = 'device'
	AND LOWER(column_name) = 'teleport';
