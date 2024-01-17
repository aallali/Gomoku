install:
	pnpm install

dev:
	pnpm dev

build:
	pnpm build

serve:
	npx serve -l 1338 -s dist

clean:
	rm -rf dist
	rm -rf .vite
	rm pnpm-lock.yaml
	
fclean:
	rm -rf node_modules
	rm -rf dist
	rm -rf .vite
	rm pnpm-lock.yaml

.DEFAULT_GOAL := default

default: install build serve
