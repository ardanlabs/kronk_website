.PHONY: run install build update-deps

build:
	npm run build

run: build
	npm run dev

install:
	npm install

update-deps:
	npm update
	npx update-browserslist-db@latest
