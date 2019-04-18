publish:
	git checkout master
	make compile-typescript
	make check-project
	npm version ${VER}
	git push
	npm publish

check-project:
	/bin/bash ./check-project.sh

compile-typescript:
	npm run compile-ts
