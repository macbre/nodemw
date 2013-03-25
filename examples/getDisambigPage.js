/**
 * Example script preparing ship disambig pages for translation
 */

var bot = require('../lib/bot'),
	client = new bot({
		server: 'en.wikipedia.org',
		path: '/w',
		debug: false
	});

var titles = [
	'Manta',
	'Maple',
	'Marathon'
];

var template = "== USS $1 ==\n" +
"{{s|disambig}}\n" +
"[[Okręt]]y [[United States Navy|US Navy]] o nazwie '''[[Lista akronimów przed nazwami okrętów|USS]] \"$1\"'''\n" +
"\n*Pierwszy\n*Drugi\n" +
"\n$2\n" +
"[[:Kategoria:Nazwy okrętów amerykańskich|$1]]\n" +
"[[:en:USS $1]]";

titles.forEach(function(title) {

	client.getArticle('USS ' + title, function(content) {
		//console.log(content);

		var items = content.match(/\*(.*)\n/g);

		//console.log(items);

		var newContent = template.
			replace(/\$1/g, title).
			replace(/\$2/g, items.join(""));

		//console.log('====');
		console.log(newContent);

		console.log("\n\n\n\n");
	});

});
