install:
	pnpm install

dev:
	pnpm dev

build:
	pnpm build

serve:
	serve -l 1338 -s dist

clear:
	rm -rf dist
	rm -rf .vite

.DEFAULT_GOAL := default

default: install build serve
