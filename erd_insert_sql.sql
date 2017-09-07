INSERT INTO
	_cub_schema_comments (
		table_name,
		column_name,
		description,
		last_updated,
		last_updated_user
	)
VALUES
	(
		'user',
		'*',
		'사용자 테이블',
		CURRENT_TIMESTAMP,
		CURRENT_USER
	);

INSERT INTO
	_cub_schema_comments (
		table_name,
		column_name,
		description,
		last_updated,
		last_updated_user
	)
VALUES
	(
		'device',
		'*',
		'장치 테이블',
		CURRENT_TIMESTAMP,
		CURRENT_USER
	);
INSERT INTO
	_cub_schema_comments (
		table_name,
		column_name,
		description,
		last_updated,
		last_updated_user
	)
VALUES
	(
		'device',
		'teleport',
		'통신가능여부',
		CURRENT_TIMESTAMP,
		CURRENT_USER
	);

