var express = require('express');
const request = require('request');
var SuperAgent = require('superagent');
var cheerio = require('cheerio');
var rp = require("request-promise") //进入request-promise模块
var fs = require("fs"); //进入fs模块
var path = require("path");

var app = express();

function downloadImage(data, src) {
    console.log('src', src);
    // var $ = cheerio.load(data.res);
    //   if ($(".main-image").find("img")[0]) {
    //     let imgSrc = $(".main-image").find("img")[0].attribs.src;//图片地址
    //     // let headers = {
    //     //   Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
    //     //   "Accept-Encoding": "gzip, deflate",
    //     //   "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    //     //   "Cache-Control": "no-cache",
    //     //   Host: "i.meizitu.net",
    //     //   Pragma: "no-cache",
    //     //   "Proxy-Connection": "keep-alive",
    //     //   Referer: data.url,
    //     //   "Upgrade-Insecure-Requests": 1,
    //     //   "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.19 Safari/537.36"
    //     // };//反防盗链
    //     rp({
    //       url: imgSrc,
    //       resolveWithFullResponse: true,
    //     //   headers
    //     }).pipe(fs.createWriteStream(`/home/schrodinger/testProject/nodeLearn/lesson3/${src}`));//下载
    //     console.log(`/home/schrodinger/testProject/nodeLearn/lesson3/${src}下载成功`);
    //   } else {
    //     console.log(`/home/schrodinger/testProject/nodeLearn/lesson3/${src}加载失败`);
    //   }
    // rp({
    //     uri: src,
    //     resolveWithFullResponse: true,
    //   //   headers
    //   }).pipe(fs.createWriteStream(`/home/schrodinger/testProject/nodeLearn/lesson3/${path.basename(src)}.jpg`));//下载
    //   console.log(`/home/schrodinger/testProject/nodeLearn/lesson3/${src}下载成功`);

    request.head(src, function (err, res, body) {
        //console.log('content-type:', res.header['content-type']);//返回图片的类型
        console.log('content-length:', res);//图片大小
        if (err) {
            console.log('err: ' + err);
            return false;
        }
        console.log('请求：' + res);
        request(src).pipe(fs.createWriteStream('/home/schrodinger/testProject/nodeLearn/picdir/' + path.basename(src))).on('close', function () {
            console.log(path.basename(src) + "保存成功");//request的流数据pipe保存到 picdir文件夹下
        });
    });
}

app.get('/', function (req, res, next) {
    SuperAgent.get('https://cnodejs.org/')
        .end(function (err, sres) {
            if (err) {
                return next(err);
            }
            var $ = cheerio.load(sres.text);
            var items = [];
            var items2 = [];
            $('#topic_list .topic_title').each(function (idx, element) {
                var $element = $(element);
                items.push({
                    title: $element.attr('title'),
                    href: $element.attr('href'),
                })
            })
            $('#topic_list .user_avatar img').each(function (idx, element) {
                var $element = $(element);
                items2.push({
                    author: $element.attr('title'),
                    img: $element.attr('src')
                })
                if ($element.attr('src').indexOf('http') > -1) {
                    downloadImage(1, $element.attr('src'))
                }
            })
            items2.map((ele, idx) => {
                items[idx].author = ele.author;
                items[idx].img = ele.img;
            })
            res.send(items);
        })
})


app.listen(3000, function (req, res) {
    console.log('app is running at port 3000');
})