SHELL := bash
.ONESHELL:
.SHELLFLAGS := -eu -o pipefail -c
.DELETE_ON_ERROR:
MAKEFLAGS += --warn-undefined-variables
MAKEFLAGS += --no-builtin-rules

dev-up:
	docker-compose up

dev-build:
	docker-compose bulid

prod-up:
	docker-compose -f production.yml up -d

prod-down:
	docker-compose -f production.yml down

prod-bulid:
	docker-compose -f production.yml build
