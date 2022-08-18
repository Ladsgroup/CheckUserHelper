// License: GPLv3
// Source: https://github.com/Ladsgroup/CheckUserHelper
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

        for (user in data) {
            var tr = tbl.insertRow();
            var td = tr.insertCell();
            var userElement = document.createElement('a');
            userElement.setAttribute('href', '/wiki/Special:Contributions/' + mw.util.escapeIdForLink(user));
            userElement.textContent = user;
            td.appendChild(userElement);
            var ips = document.createElement('ul');
            for (i = 0, len = data[user].sorted.ip.length; i < len; i++) {
                var ipText = data[user].sorted.ip[i];
                var ip = document.createElement('li');
                var counter = document.createElement('span');
                counter.style.cssText += 'user-select: none;';
                counter.textContent = ' [' + data[user].ip[ipText] + ']';
                ip.textContent = ipText;
                ip.appendChild(counter);
                ips.appendChild(ip);
            }
            var td = tr.insertCell();
            td.appendChild(ips);

            var uas = document.createElement('ul');
            for (i = 0, len = data[user].sorted.ua.length; i < len; i++) {
                var uaText = data[user].sorted.ua[i];
                var ua = document.createElement('li');
                var uaCode = document.createElement('code');
                uaCode.textContent = uaText;
                ua.textContent = ' [' + data[user].ua[uaText] + ']';
                ua.prepend(uaCode);
                uas.appendChild(ua);
            }
            var td = tr.insertCell();
            td.appendChild(uas);
        }
        $('#checkuserform').after(tbl);
    }

    function createTableText(data) {
        var text = "{| class=wikitable\n! User!! IP(s)!! UA(s)\n|-\n";

        for (let user in data) {
            text += "|" + user + "||"
            if (data[user].sorted.ip.length > 1) {
                for (i = 0, len = data[user].sorted.ip.length; i < len; i++) {
                    var ipText = data[user].sorted.ip[i];
                    text += "\n* " + ipText + ' [' + data[user].ip[ipText] + ']';
                }
            } else {
                let ipText = data[user].sorted.ip[0];
                text += ipText + ' [' + data[user].ip[ipText] + ']';
            }
            text += "\n|";

            for (i = 0, len = data[user].sorted.ua.length; i < len; i++) {
                var uaText = data[user].sorted.ua[i];
                text += "\n* <code>" + uaText + '</code> [' + data[user].ua[uaText] + ']';
            }

            text += "\n|-\n";
        }
        text += "|}";
        return text;
    }

    function compareIPs(a, b) {
        const num1 = a.indexOf('.') > -1 ? Number(a.split(".").map((num) => (`000${num}`).slice(-3)).join("")) : Number('0x' + a.split(":").map((num) => (`0000${num}`).slice(-4)).join(""));
        const num2 = b.indexOf('.') > -1 ? Number(b.split(".").map((num) => (`000${num}`).slice(-3)).join("")) : Number('0x' + b.split(":").map((num) => (`0000${num}`).slice(-4)).join(""));
        return num1-num2;
    }


    function theGadget() {
        var data = {}, hasData = false;
        $('#checkuserresults li').each(function () {
            var uas = {}, ips = {}, ip, ua;
            var user = $(this).children('span').children('.mw-userlink').first().text();
            if (!user) {
                return;
            }
            var ua = $(this).find('.mw-checkuser-agent').text();
            if (!ua) {
                var uas = {};
                $(this).children('ol').last().children('li').children('i').each( function() {
                    var uaText = $(this).text();
                    uas[uaText] = uas[uaText] || 0;
                    uas[uaText] += 1;
                });
            } else {
                uas = {};
                uas[ua] = 1;
            }
            var ip = $(this).children('.mw-checkuser-indented').children('small').children('a').children('bdi').text();
            if (!ip) {
                var ips = [];
                $(this).children('ol').first().children('li').children('a').each( function() {
                    var ipText = $(this).children('bdi').text();
                    ips[ipText] = ips[ipText] || 0;
                    ips[ipText] += 1;
                });
            } else {
                ips = {};
                ips[ip] = 1;
            }
            hasData = true;
            if (data[user]) {
                for (ip in ips) {
                    data[user].ip[ip] = data[user].ip[ip] || 0;
                    data[user].ip[ip] += ips[ip];
                }
    
                for (ua in uas) {
                    data[user].ua[ua] = data[user].ua[ua] || 0;
                    data[user].ua[ua] += uas[ua];
                }
            } else {
                data[user] = { ip: ips, ua: uas };
            }
        });
        
        if (!hasData) {
            return;
        }
        // sort IPs and UAs
        $.each(data, function(idx){
            ip = Object.keys(data[idx].ip);
            ip.sort(compareIPs);
            ua = Object.keys(data[idx].ua);
            data[idx].sorted = {
                ip: ip,
                ua: ua.sort()
            };
        });
        createTable(data);
        var copyText = createTableText(data);
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

    if (mw.config.get('wgCanonicalSpecialPageName') == 'CheckUser') {
        theGadget();
    }
})(jQuery);
