.PHONY: build

build:
	rm -rf build/ && ./node_modules/.bin/babel source -d build

build-browser-test:
	make && browserify build/test.js -o build/browser-test.js && echo "Browser test build ready."

watch-browser-test:
	fswatch -o source/ | xargs -n1 -I{} make build-browser-test
