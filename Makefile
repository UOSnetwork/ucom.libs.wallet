publish:
	git checkout master
	make compile-typescript
	make check-project-with-snyk
	npm version ${VER}
	git push
	npm publish

publish-without-checks:
	git checkout master
	npm version ${VER}
	git push
	npm publish

check-project:
	make check-by-eslint
	/bin/bash ./check-project.sh

check-project-with-snyk cps:
	make check-project
	make check-by-snyk

compile-typescript:
	npm run compile-ts

compile-typescript-watch:
	npm run compile-ts-watch

check-by-eslint:
	npm run check-by-eslint

check-by-snyk:
	snyk test

print-current-version pcv:
	npm list | grep 'wallet'
