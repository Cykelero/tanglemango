.PHONY: build

build:
	rm -rf build/ && ./node_modules/.bin/babel source -d build
