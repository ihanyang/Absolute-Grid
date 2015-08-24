var http = require("http"),
    fs = require("fs"),
    querystring = require("querystring"),
    mime = require("mime"),
    url = require("url"),
    path = require("path"),
    root = __dirname,
    server = http.createServer(function (req, res) {
        show(req, res)
    }),
    show = function (req, res) {
        var FilePath = url.parse(req.url).pathname === "/" ? path.join(root, "/index.html") : path.join(root, url.parse(req.url).pathname)

        if (url.parse(req.url).pathname === "/api") {
            FilePath = path.join(root, "/data.json")
        }
        
        var stream = fs.createReadStream(FilePath)

        stream.on("error", function (error) {
            if (error.code === "ENOENT") {
                res.writeHead(404, {
                    "Content-Type": "text/html"
                })

                res.write("<h1>404 Not Found</h1>")

                res.end()  
            } else {
                res.statusCode = 500

                res.end("server error")
            }

            console.log(error)
            
        })

        fs.stat(FilePath, function (error, stat) {
            if (! error) {
                res.writeHead(200, {
                    "Content-Length": stat.size,
                    "Content-Type": mime.lookup(FilePath)
                })

                stream.pipe(res)
            }
        })
    }

server.listen(process.env.PORT || 1314)

console.log("server running at http://localhost:1314")


// var list = fs.readdirSync(path.join(root, "/images"))

// var getStr = function () {
//     var length = Math.floor(Math.random() * 7 + 2)
//     var str = ""
//     var abc = "abcdefghijklmnopqrstuvwxyz".split("")

//     while(length) {
//         str += abc[Math.floor(Math.random() * 26)];
//         length = length - 1;
//     }

//     return str
// }

// var a = list.map(function (v, i) {
//     var str = getStr()

//     var obj = {
//         url: "/images/" + v,
//         index: i,
//         name: str
//     }

//     return obj
// })

// fs.writeFile("data.json", JSON.stringify(a))

