var eventproxy = require('eventproxy');
var superagent = require('superagent');
var cheerio = require('cheerio');
var url = require('url');
var async = require('async');

var cnodeUrl = 'https://cnodejs.org/';

superagent.get(cnodeUrl)
    .end(function (err, res) {
        if (err) {
            return console.error(err);
        }
        var topicUrls = [];
        var $ = cheerio.load(res.text);

        $('#topic_list .topic_title').each(function (idx, element) {
            var $element = $(element);
            var href = url.resolve(cnodeUrl, $element.attr('href'));
            topicUrls.push(href);
        });

        console.log(topicUrls);

        var concurrencyCount = 0;
        var fetchUrl = function (url, callback) {
            var delay = parseInt((Math.random() * 10000000) % 2000, 10);
            concurrencyCount++;
            console.log('现在的并发数是', concurrencyCount, ', 正在抓取的是', url, ',耗时' + delay + '毫秒');
            superagent.get(url)
                .end(function (err, res) {
                    console.log('fetch' + url + ' successful');
                    ep.emit('topic_html', [url, res.text]);
                })
            setTimeout(function () {
                concurrencyCount--;
                callback(null, url + ' html content');
            }, delay);
        }

        var ep = new eventproxy();
        ep.after('topic_html', topicUrls.length, function (topics) {
            topics = topics.map(function (topicPair) {
                var topicUrl = topicPair[0];
                var topicHtml = topicPair[1];
                var $ = cheerio.load(topicHtml)
                return ({
                    title: $('.topic_full_title').text().trim(),
                    href: topicUrl,
                    comment1: $('.reply_content').eq(0).text().trim(),
                    author: $('.changes a').text().trim(),
                    score: $('.floor .big').text().slice(3).trim()
                });
            })

            console.log('final:');
            console.log(topics);
        })

        async.mapLimit(topicUrls, 5, function (url, callback) {
            fetchUrl(url, callback);
            // topicUrls.forEach(function (topicUrl) {

            // })
        }, function (err, result) {
            console.log('final:');
            console.log(result);
        })


    })

var ep = new eventproxy();

