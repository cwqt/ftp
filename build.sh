#!/bin/sh
rm -rf _site/
mkdir _site/
npm run build #harp compile skeleton
node compile.js #add in stuff to skeleton
#get all files (not hidden), get number of lines (files), format as 1,234 
FILECOUNT=$(find ./f -not -path '*/\.*' -type f | wc -l | awk '{ printf("%'"'"'d\n",$1); }')
sed -i -e "s/FILE_COUNT/$FILECOUNT/g" ./_site/index.html

COMMIT=$(curl --silent --header "PRIVATE-TOKEN: $GITLAB_API_KEY" "https://gitlab.com/api/v4/projects/23430748/repository/commits/ftp" | jq '.short_id' | tr -d \")
sed -i -e "s/GIT_SHA/$COMMIT/g" ./_site/index.html

cp -r www _site/
cp  compile.js _site/
cp k.txt _site/
cp README.md _site/
exit 0
