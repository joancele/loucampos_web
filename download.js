const fs = require('fs');
fetch('https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzQ0YmIyYjMyMTg1MTRkZjE5Y2VlMTRmZTFjZjc1YzYyEgsSBxDwqfqk1ggYAZIBIwoKcHJvamVjdF9pZBIVQhMxOTY1OTEwMDI1MzQ3MTU2MzE3&filename=&opi=89354086')
  .then(res => res.text())
  .then(text => {
    fs.writeFileSync('landing_utf8.html', text, 'utf8');
    console.log('Done');
  })
  .catch(err => console.error(err));
