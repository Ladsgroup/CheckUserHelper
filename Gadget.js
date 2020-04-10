function createTable(data){
    var tbl  = document.createElement('table');
    tbl.className = 'wikitable';
    tbl.id = 'SummaryTable';
    var tr = tbl.insertRow();
    tr.appendChild($('<th>').text('User')[0]);
    tr.appendChild($('<th>').text('IP(s)')[0]);
    tr.appendChild($('<th>').text('User Agent(s)')[0]);

    for(user in data){
        var tr = tbl.insertRow();
        var td = tr.insertCell();
                td.appendChild(document.createTextNode(user));
        if ( data[user].ip.length > 1) {
            var ips = document.createElement('ul');
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

        if ( data[user].ua.length > 1) {
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
                td.appendChild( ua );
        }
    }
    $('#checkuserform').after(tbl);
}

function createTableText(data){
    var text = "{| class=wikitable\n! User!! IP(s)!! UA(s)\n|-\n";

    for(user in data){
        text += "|" + user + "||"
        if ( data[user].ip.length > 1) {
            for (i = 0, len = data[user].ip.length; i < len; i++) {
                text += "\n* " + data[user].ip[i];
            }
        } else {
            text += data[user].ip
        }
        text += "\n|"

        if ( data[user].ua.length > 1) {
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


function theGadget () {
    var data = {}, hasData = false;
    $('#checkuserresults li').each( function () { 
        var user = $(this).children('span').children('.mw-userlink').attr('title');
        if (!user) {
            return;
        }
        var ua = $(this).children('small').children('.mw-checkuser-agent').text();
        if (!ua) {
            return;
        }
        var ip = $(this).children('small').children('a').children('bdi').text();
        if (!ip) {
            return;
        }
        hasData = true;
        if (data[user]) {
            if (data[user].ip.indexOf(ip) === -1 ) {
                data[user].ip.push(ip);
            }
            
            if (data[user].ua.indexOf(ua) === -1 ) {
                data[user].ua.push(ua);
            }
        } else {
            data[user] = {ip: [ip], ua: [ua]};
        }
    })
    if (!hasData) {
        return;
    }
    createTable(data);
    var copyText = createTableText(data);
    mw.loader.using("mediawiki.widgets", function() {
        var dir = (document.getElementsByTagName('html')[0].dir == 'ltr') ? 'left' : 'right';
        var shortened = new mw.widgets.CopyTextLayout( {
                                    align: 'top',
                                    copyText: copyText,
                                    successMessage: 'Copied',
                                    multiline: true,
                                    failMessage: 'Could not copy'
                                } );
        shortened.textInput.$element.css(dir, '-9999px');
        shortened.textInput.$element.css('position', 'absolute');
        shortened.buttonWidget.$element.css('position', 'absolute');
        shortened.buttonWidget.$element.css(dir, '0px');
        shortened.buttonWidget.$element.after('<br>');
        $('#SummaryTable').after(shortened.$element);
        
    });
};

if ( mw.config.get('wgCanonicalSpecialPageName') == 'CheckUser' ) {
    theGadget();
}
