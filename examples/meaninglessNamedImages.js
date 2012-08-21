var bot = require('../lib/bot').bot;

var client = new bot('config.js');

var i = 0;
client.logIn(function(){
    var imagesToDo = [];
    var imageArray = [];
    function getBatch(start) {
        client.getImages(start, function(data, next) {
            imageArray = imageArray.concat(data);
            if (next) {
                getBatch(next);
            }
            else {

                imageArray.forEach(function(item){

                    if (item.name.match(/^[0-9]+\.$/i)){
                        imagesToDo.push(item.name);
                        //rename(item.name);
                    }
                    if (item.name.match(/^P[0-9]+/)){
                        imagesToDo.push(item.name);
                       // rename(item.name);
                    }
                    if (item.name.match(/^IMG/i)){
                        imagesToDo.push(item.name);
                        //rename(item.name);
                    }
                    if (item.name.match(/^DSC/i)){
                        imagesToDo.push(item.name);
                       // rename(item.name);
                    }
                    if (item.name.match(/^jpeg/i)){
                        imagesToDo.push(item.name);
                       // rename(item.name);
                    }
                });
                    perform(0);
                console.log("To do: " + imagesToDo.length);
            }

        });
    }

    getBatch(0);

    function perform(number){
        if (number < imagesToDo.length){
            console.log(i + " " + imagesToDo[number]);
            i++;
            rename(imagesToDo[number]);
        }
    }


    function rename(filename){
        client.getImageUsage("Plik:" + filename, function(img){
            if (img[0] != null){
                var extension = filename.match(/\.\D+$/i)[0];
                extension = extension.toLowerCase();
                changeName(filename, img[0].title, extension);
            }
            else
            {
                client.getArticle("File_talk:" + filename, function(content){
                    if (content == null){
                        content = "{{Image orphan}}\n";
                        client.edit("File_talk:" + filename, content, "[[User:OzgaBot|OzgaBot]] added 'Image orphan' template", function(){
                            console.log(filename + " was marked as orphan image");
                        });
                    }
                    else if (content.match(/Obraz sierota/gi) == null){
                        content = "{{Obraz sierota}}\n" + content;
                        client.edit("File_talk:" + filename, content, "[[User:OzgaBot|OzgaBot]] added 'Image orphan' template'", function(){
                            console.log(filename + " was marked as orphan image");
                        });
                    }
                });
                perform(i);
            }
        });
    }

    function changeName(filename, title, extension){
        client.getArticle("File:" + title + extension, function(content){
            if (content == null){
                client.move(
                    "File:" + filename,
                    "File:" + title + extension,
                    "",
                    function(){
                        client.getArticle("File:" + title + extension, function(content2){
                            content = content + "\n[[Category:" + title + "]]";
                            client.edit("File:" + title + extension, content, "[[User:OzgaBot|OzgaBot]] added file to category " + title, function(){
                                console.log(title + extension + " another one bites the dust xD");
                                perform(i);
                            });
                        });
                    });
            }
            else{
                console.log("file " + title + extension + " already exists");
                changeNameWithNumber(filename, title, extension, 1);

            }
        })
    }

    function changeNameWithNumber(filename, title, extension, number){
        var title1 = title + " " + number;
        client.getArticle("File:" + title1 + extension, function(content){
            if (content == null){
                client.move(
                    "File:" + filename,
                    "File:" + title1 + extension,
                    "",
                    function(){
                        client.getArticle("File:" + title1 + extension, function(content2){
                            content2 = content2 + "\n[[Category:" + title + "]]";
                            client.edit("File:" + title1 + extension, content2, "[[User:OzgaBot|OzgaBot]] added file to category " + title, function(){
                                console.log(title1 + extension + " another one bites the dust xD");
                                perform(i);
                            });
                        });
                    });

            }
            else{
                console.log("file " + title1 + extension + " already exists");
                var iterator = number + 1;
                changeNameWithNumber(filename, title, extension, iterator);
            }
        });
    }
})
