var fs = require('fs');
var path = require('path');
var filePath = path.resolve('./ignorelist.json');
console.log(filePath);
				fs.readFile(filePath, 'utf8', function(err,data){
					console.log(data);
                    totalFile = data.replace(/"(\w[global]*)":(.*)]/g, "test");
                    console.log(totalFile);
					console.log(err);
				});