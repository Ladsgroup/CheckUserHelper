// Author: [[User:Ladsgroup]], [[User:Huji]]
// License: GPLv3
// Source: https://github.com/Ladsgroup/CheckUserHelper
// Load using: mw.loader.load('//fa.wikipedia.org/w/index.php?title=User:Huji/CheckUserHelper.js&action=raw&ctype=text/javascript');
// Reset interface using: $('#SummaryTable').remove(); $('.mw-widget-copyTextLayout').remove();
// Debug using: $('#SummaryTable').remove(); $('.mw-widget-copyTextLayout').remove(); mw.loader.load('//fa.wikipedia.org/w/index.php?title=User:Huji/CheckUserHelper.js&action=raw&ctype=text/javascript');
(function ($) {
    function createTable(data) {
        var tbl = document.createElement('table');
        tbl.className = 'wikitable';
        tbl.id = 'SummaryTable';
        var tr = tbl.insertRow();
        mw.loader.using( 'jquery.makeCollapsible' ).then( function () {
			$('#SummaryTable').makeCollapsible();
		} );
        tr.appendChild($('<th>').text('User')[0]);
        tr.appendChild($('<th>').text('IP(s)')[0]);
        tr.appendChild($('<th>').text('User Agent(s)')[0]);

        for (var user in data) {
            var tr = tbl.insertRow();
            var td = tr.insertCell();
            td.appendChild(document.createTextNode(user));
            if (data[user].ip.length > 1) {
                var ips = document.createElement('ul');
                ips.setAttribute('id', 'iplist');
                for (i = 0, len = data[user].ip.length; i < len; i++) {
                    var ip = document.createElement('li');
                    ip.innerHTML = data[user].ip[i];
                    ips.appendChild(ip);
                }
                var td = tr.insertCell();
                td.appendChild(ips);
            } else {
                var td = tr.insertCell();
                td.appendChild(document.createTextNode(data[user].ip[0]));
            }

            if (data[user].ua.length > 1) {
                var uas = document.createElement('ul');
                for (i = 0, len = data[user].ua.length; i < len; i++) {
                    var ua = document.createElement('li');
                    ua.innerHTML = '<code>' + data[user].ua[i] + '</code>';
                    uas.appendChild(ua);
                }
                var td = tr.insertCell();
                td.appendChild(uas);
            } else {
                var td = tr.insertCell();
                var ua = document.createElement('code');
                ua.innerText = data[user].ua[0];
                td.appendChild(ua);
            }
        }
        $('#checkuserform').after(tbl);
    }

    function getCIDR(ip) {
        console.log('Querying for ' + ip);
        var cidr = {
            country: false,
            range: false,
            name: false
        }
        return new Promise((resolve) => {
            $.ajax({
                url: 'https://stat.ripe.net/data/whois/data.json?resource=' + ip
            }).done(function (resp) {
                rec = resp.data.records[0];
                $.each(rec, function (idx, details) {
                    switch (details.key) {
                        case 'country':
                            cidr.country = details.value;
                            break;
                        case 'inetnum':
                        case 'CIDR':
                            cidr.range = details.value;
                            break;
                        case 'netname':
                        case 'NetName':
                            cidr.name = details.value;
                            break;
                        default:
                            break;
                    }
                });
                if (cidr.range === false) {
                    cidr = false;
                }
                resolve(cidr);
            });
        });
    }

    function createTableText(data) {
        var text = "{| class=wikitable\n! User!! IP(s)!! UA(s)\n|-\n";

        for (user in data) {
            text += "|" + user + "||"
            if (data[user].ip.length > 1) {
                for (i = 0, len = data[user].ip.length; i < len; i++) {
                    text += "\n* " + data[user].ip[i];
                }
            } else {
                text += data[user].ip
            }
            text += "\n|"

            if (data[user].ua.length > 1) {
                var uas = document.createElement('ul');
                for (i = 0, len = data[user].ua.length; i < len; i++) {
                    text += "\n* <code>" + data[user].ua[i] + '</code>';
                }
            } else {
                text += "\n* <code>" + data[user].ua[0] + '</code>';
            }

            text += "\n|-\n";
        }
        text += "|}"
        return text;
    }

    function copyButton(copyText) {
        // If another copy of the button exists, remove it
        // This happens when the CIDR data is loaded (which is async and takes time)
        $('.mw-widget-copyTextLayout').remove();

        mw.loader.using("mediawiki.widgets", function () {
            var dir = (document.getElementsByTagName('html')[0].dir == 'ltr') ? 'left' : 'right';
            var shortened = new mw.widgets.CopyTextLayout({
                align: 'top',
                copyText: copyText,
                successMessage: 'Copied',
                multiline: true,
                failMessage: 'Could not copy'
            });
            shortened.textInput.$element.css(dir, '-9999px');
            shortened.textInput.$element.css('position', 'absolute');
            shortened.buttonWidget.$element.css('position', 'absolute');
            shortened.buttonWidget.$element.css(dir, '0px');
            shortened.buttonWidget.$element.after('<br>');
            $('#SummaryTable').after(shortened.$element);
        });
    }

    function theGadget() {
        var data = {}, hasData = false, user = false;
        $('#checkuserresults li').each(function () {
            if (!user) {
                user = $(this).children('span').children('.mw-userlink').attr('title');
            }
            if (!user) {
                return;
            }
            var ua = $(this).children('small').children('.mw-checkuser-agent').text();
            if (!ua) {
                var uas = [];
                $(this).children('ol').last().children('li').children('i').each( function() {
                    uas.push($(this).text());
                });
            } else {
                uas = [ua];
            }
            var ip = $(this).children('small').children('a').children('bdi').text();
            if (!ip) {
                var ips = [];
                $(this).children('ol').first().children('li').children('a').each( function() {
                    ips.push($(this).children('bdi').text());
                });
            } else {
                ips = [ip];
            }
            hasData = true;
            if (data[user]) {
                for (i in ips) {
                    ip = ips[i];
                    if (data[user].ip.indexOf(ip) === -1) {
                        data[user].ip.push(ip);
                    }
                }
    
                for (i in uas) {
                    ua = uas[i];
                    if (data[user].ua.indexOf(ua) === -1) {
                        data[user].ua.push(ua);
                    }
                }
            } else {
                data[user] = { ip: ips, ua: uas };
            }
        });
        if (!hasData) {
            return;
        }
        createTable(data);
        var copyText = createTableText(data);
        copyButton(copyText);

        // Pull CIDR info; takes time
        async function displayCIDR(data) {
            var cidr = {};

            for (const thisip of data[user].ip) {
                thiscidr = await getCIDR(thisip);
                if (cidr[thiscidr.range] === undefined) {
                    cidr[thiscidr.range] = thiscidr;
                    cidr[thiscidr.range].ips = [thisip];
                } else {
                    console.log(thiscidr.range + ' already existed!');
                    cidr[thiscidr.range].ips.push(thisip);
                }
            }
            $('#SummaryTable ul#iplist').empty();
            $.each(cidr, function (idx, c) {
                var li = document.createElement('li');
                if (c.ips.length > 1) {
                    li.innerHTML = c.range + ' (' + c.country + ')';
                } else {
                    li.innerHTML = c.ips[0] + ' (' + c.country + ')';
                }
                $('#SummaryTable ul#iplist').append(li);
            });

            copyText = createTableText(data);
            copyButton();
        }

        displayCIDR(data);
    };

    if (mw.config.get('wgCanonicalSpecialPageName') == 'CheckUser') {
        theGadget();
    }
})(jQuery);
