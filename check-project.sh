#!/bin/bash

echo "Let's check project"
gitOutput="$(git status --porcelain)"
npmOutdated="$(npm outdated)"

if [[ -z "$gitOutput" ]]; then
echo "Working directory clean"
else
    echo ERROR: Git status - there are changes. Please commit them. ${gitOutput}. 1>&2
    exit 1 # terminate and indicate error
fi

if [[ -z "$npmOutdated" ]]; then
echo "All packages are up to date"
else
    echo ERROR: There are a couple of outdated packages. 1>&2
    exit 1 # terminate and indicate error
fi
