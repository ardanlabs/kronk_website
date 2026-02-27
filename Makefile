.PHONY: run install build

build:
	npm run build

run: build
	npm run dev

install:
	npm install
