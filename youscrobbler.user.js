// ==UserScript==
// @name          YouScrobbler
// @namespace	  userscripts.org
// @author        http://www.lukash.de
// @description   Scrobbles the currently watching YouTube video to last.fm.
// @identifier	  http://userscripts.org/scripts/source/119694.user.js
// @include       http://*.youtube.com/*
// @include       https://*.youtube.com/*
// @include       http://youtube.com/*
// @include       https://youtube.com/*
// @include       *//*.youtube.com/tv*
// @grant	      GM_getValue
// @grant	      GM_setValue
// @grant	      GM_xmlhttpRequest
// @downloadURL	  https://raw.githubusercontent.com/floblik/YouScrobbler/master/youscrobbler.user.js
// @updateURL 	  http://youscrobbler.lukash.de/youscrobbler.meta.js
// @version       1.2.8
// ==/UserScript==

/**
*	You can contact me on http://www.lukash.de/youscrobbler or on http://userscripts.org/scripts/show/119694 if you have got suggestions, bugs or oter questions
*
*	*YouScrobbler is build on the code of youscrobble (http://userscripts.org/scripts/show/71606) but its an new script with many new features
*	*Authentication-Function is adapted from ScrobbleSmurf (http://daan.hostei.com/lastfm/)
*/

if (window.top !== window.self) {
  return;
}

const VERSION = "1.2.8";
const APIKEY = "d2fcec004903116fe399074783ee62c7";

var lastFmAuthenticationUrl = "http://www.last.fm/api/auth";
var youtubeApiUrl = "http://gdata.youtube.com/feeds/api/videos/";
var authenticationSessionUrl = "http://youscrobbler.lukash.de/auth";
var scrobbleSongUrl = "http://youscrobbler.lukash.de/scrobblesong/";

var currentURL = document.URL;
var loadgif = '<div class="us_loadgif"><img alt="loading" src="data:image/gif;base64,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" /></div>';
var icon;
var BFather,TO3,TO1,TO5,TO6;
var TO2 = 0;
var TO1Helper = false;
var creload = 0;
var isGM;
var functionsLoaded = false;

var trackInfoFromDB = false;
var secs = 0;
var album;

/**
*	--- Content ---
*	1. Initializing
*	2. General Functions
*	3. Appearance
*	4. Scrobbling and Login
*	5. Information request
*	6. Miscellaneous
*	7. Third party functions
*	8. Update
*/


/**
*	--- 1. Initializing ---
*/
function init() {
	isGM = typeof GM_getValue != 'undefined' && typeof GM_getValue('a', 'b') != 'undefined';
	if (!isLoggedIn()) {
		tryGetAuthToken();
	}
	us_addButton();
	checkFirstRun();
	
}

function updateUrl () {
	return "http://youscrobbler.lukash.de/currentversion";
}
function scriptDownloadUrl () {
	return "http://youscrobbler.lukash.de/youscrobbler.user.js";
}

function us_reset () {
	setTimeout(function () {us_closebox();},0);
	trackInfoFromDB = false;
	secs = 0;
	currentURL = document.URL;
	document.getElementById("us_temp_info").setAttribute("us_video_id", getYouTubeVideoId());
	document.getElementById("us_temp_info").setAttribute("us_secs", secs);
	document.getElementById("us_temp_info").removeAttribute("artist");
	document.getElementById("us_temp_info").removeAttribute("track");
	document.getElementById("us_temp_info").removeAttribute("autoscrobbleerror");
	document.getElementById("us_temp_info").removeAttribute("scrobbled");
	document.getElementById("us_temp_info").setAttribute("us_leftToPlay", -1);
	document.getElementById("us_temp_info").removeAttribute("us_playstart");
	document.getElementById("us_temp_info").removeAttribute("us_playstart_s");
	us_saveValue("is_full_album", 0);
	
	//save time page was loaded aka playstart time in ctime and gay format
	var time = new Date();
	var t = Math.round(time.getTime()/1000);
	var m = time.getUTCMonth()+1;
	var d = time.getUTCDate();
	if (m.toString().length == 1) {
	   m='0'+m;
	}
	if (d.toString().length == 1) {
	   d='0'+d;
	}
	var t2 = time.getUTCFullYear()+'%2d'+m+'%2d'+d+'%20'+time.getUTCHours()+'%3a'+time.getUTCMinutes()+'%3a'+time.getUTCSeconds();
	us_saveTempData("us_playstart", time.getUTCFullYear()+'%2d'+m+'%2d'+d+'%20'+time.getUTCHours()+'%3a'+time.getUTCMinutes()+'%3a'+time.getUTCSeconds());
	us_saveTempData("us_playstart_s", Math.round(time.getTime()/1000));
	
	us_abortScrobbling();
	getVideoSecs();
	getTrackInfo();
	us_buttonStatus();
}

/**
*	--- 2. General Functions ---
*/
function initPreferences () {
	if (!us_getValue('us_boxpos')) {
		us_saveValue('us_boxpos',(screen.availWidth)/1.3+"px-"+70+"px");
	}
	if ((!us_getValue('us_color')) || (us_getValue('us_color')=="r")) {
		us_saveValue('us_color','red');
	}
	if (!us_getValue('database.id')) {
		us_saveValue('database.id', "");
		us_saveValue('database.artist', "");
		us_saveValue('database.track', "");
	}
	if (!us_getValue('database_additional.id')) {
		us_saveValue('database_additional.id', "");
		us_saveValue('database_additional.albumtitle', "");
		us_saveValue('database_additional.mbid', "");
	}
	if (!us_getValue("database.maxEntries")) {
		us_saveValue("database.maxEntries", 5000);
	}
	if (!us_getValue("scrobble_at")) {
		us_saveValue("scrobble_at", 95);
	}
	if (us_getValue("us_autoscrobble_active", "nf") == "nf") {
		us_saveValue("us_autoscrobble_active", 1);
	}
	if (us_getValue('asFailNotification', "nf") == "nf") {
		us_saveValue('asFailNotification', false);
	}
	if (us_getValue('scrobblingNotification', "nf") == "nf") {
		us_saveValue('scrobblingNotification', true);
	}
	if (us_getValue('us_color') == 'red') {
		icon = "data:image/gif;base64,R0lGODlhEAAQAKIAAPNHLdYzINJbTN2rp%2FHSztCBerIRC%2Ff39yH5BAAAAAAALAAAAAAQABAAAANQSAXczoW8Sau9LwShA9AC52nFYR6ccKLgMWxmMBxwoc2dWsy2YQSGmc93IAQIppdPOMT9SgOfKioLFIHWqK9kIhhUK%2BDwN%2F5pyui0eq1dNxMAOw%3D%3D";
	}
	else {
		icon = "data:image/gif;base64,R0lGODlhEAAQAKIAACUlJVVVVT4%2BPvLy8pubm1RUVHFxccnJySH5BAAAAAAALAAAAAAQABAAAANQeBbczua8Sau9T4iiRdAF52nGYA5ccaLgQGymQAywoc2dasw2AAiAmc83OAgOppdPOMT9SgSfKioTFIHWqK9kOgBUK%2BDwN%2F5pyui0eq1dNxMAOw%3D%3D";
	}
}

//gets the array location of the name attribute of an element, returns -1 if not found
function getAttributeLocation(attribute,element)  {
	
		if(element.attributes!==null){
			for(attribCounter=0;attribCounter<element.attributes.length;attribCounter++)
			{
				if(element.attributes[attribCounter].name==attribute)
					return attribCounter;
			}
		}
		
		return 0;// -1
} 

// Creates a <type id="id">
function createIdElement(type, id) {
	var el = document.createElement(type);
	var idatr = document.createAttribute("id");
	idatr.nodeValue = id;
	el.setAttributeNode(idatr);
	return el;
}

function us_movebox(e) {
 	e = (e) ? e : ((window.event) ? window.event : "");
	if (us_getValue('us_drag')) {
		var el = document.getElementById('us_loginbox');
		el.style.left = (150+e.clientX-us_getValue('us_drag').split('-')[0])+"px";
		el.style.top = e.clientY-us_getValue('us_drag').split('-')[1]+"px";
	}
} 
function us_moveboxd(e) {
	var el = document.getElementById('us_loginbox');
	us_saveValue('us_drag',(e.clientX-el.offsetLeft)+"-"+(e.clientY-el.offsetTop));
} 
function us_moveboxu(e) {
	var el = document.getElementById('us_loginbox');
	us_saveValue('us_boxpos',el.style.left+"-"+el.style.top);
	us_saveValue('us_drag',false);
} 


function GM_main () {
    window.stateChanged = function (state) {
		var playerNode  = document.getElementById ("movie_player");
		//get video ID
		var regex = /(\?|%3F|&|%26)v=[^\?&#]*/gi;
		var matches = document.URL.match(regex);
		var vidId;
		if(matches != null) {
			var removeRegex = /(\?|%3F|&|%26)v=/gi;
			vidId = matches[0].replace(removeRegex, "");
		}
		if (state==1 && vidId != document.getElementById("us_temp_info").getAttribute("us_video_id")) { //||((state==1)&&(document.getElementById("us_temp_info").getAttribute("video_playlist_index") != -1)&&(document.getElementById("us_temp_info").getAttribute("video_playlist_index") != playlistIndex))
			TO5 = setTimeout(function () {document.getElementById("us_temp_info").setAttribute("us_reset_now", "1");}, 1000);
		}
		switch (state) {
			case 1:
			document.getElementById("us_temp_info").setAttribute("video_is_playing", "1");
			//document.getElementById("us_temp_info").setAttribute("video_playlist_index", playlistIndex);
			break;
			case 0:
			document.getElementById("us_temp_info").setAttribute("video_end_reached", "yes");
			default:	document.getElementById("us_temp_info").setAttribute("video_is_playing", "0");	
		}
		/*if (!document.getElementById("us_temp_info").getAttribute("video_playlist_index", playlistIndex)) {
			document.getElementById("us_temp_info").setAttribute("video_playlist_index", playlistIndex);
		}
		console.debug("Attribute: "+document.getElementById("us_temp_info").getAttribute("video_playlist_index"));
		console.debug("PL I: " + playlistIndex);*/
		/* if (document.getElementById("us_temp_info").getAttribute("video_playlist_index") != null) {
			document.getElementById("us_temp_info").setAttribute("video_playlist_index", playlistIndex);
		} */
		 
    }
    window.onYouTubePlayerReady = function (playerId) {
        var playerNode  = document.getElementById ("movie_player");
        if (playerNode) {
				//Note, inside onYouTubePlayerReady ONLY, the YouTube API
                //seems to override addEventListener. Hence the nonstandard
                //parameters.
            
            playerNode.addEventListener ('onStateChange', 'stateChanged');
			
			//Playlist     console.log(playerNode.getPlaylistIndex());
			
            //console.log ('GM: Listener installed just fine.');
        }
        else
            console.error ("GM: Player node not found!");
    }
}

function addJS_Node (text, s_URL, funcToRun, runOnLoad) {
    var D                                   = document;
    var scriptNode                          = D.createElement ('script');
    if (runOnLoad) {
        scriptNode.addEventListener ("load", runOnLoad, false);
    }
    scriptNode.type                         = "text/javascript";
    if (text)       scriptNode.textContent  = text;
    if (s_URL)      scriptNode.src          = s_URL;
    if (funcToRun)  scriptNode.textContent  = '(' + funcToRun.toString() + ')()';

    var targ = D.getElementsByTagName ('head')[0] || D.body || D.documentElement;
    targ.appendChild (scriptNode);
}
/**
*	Value Saving Method - Switcher
*	uses Greasemonkey GM_ or localStorage
*/
function us_saveValue(name, value) {
	if (isGM) {
		GM_setValue(name, value);
	} else {
		localStorage.setItem(name, value);
	}
}

/**
*	Value Getting Method - Switcher
*	uses Greasemonkey GM_ or localStorage
*/
function us_getValue(name, alternative) {
	if (isGM) {
		return (GM_getValue(name, alternative));
	} else {
		return (localStorage.getItem(name, alternative));
	}	
}

/**
*	Temporary save data
*	Saved in "us_temp_info" attributes
*/
function us_saveTempData(name, value) {
	document.getElementById("us_temp_info").setAttribute(name, value);
}

/**
*	Get temporary saved data
*	Saved in "us_temp_info" attributes
*/
function us_getTempData(name) {
	if (document.getElementById("us_temp_info").getAttribute(name)) {
		var value = document.getElementById("us_temp_info").getAttribute(name);
		return value;
	} else {
		return 0;
	}	
}


/**
*	--- 3. Appearance ---
*/

/**
*	Add the Scrobble Button to Video and Userpages
*/
function us_addButton() {
    us_saveValue('us_drag',false);
	
	var time = new Date();
	var t = Math.round(time.getTime()/1000);
	var m = time.getUTCMonth()+1;
	var d = time.getUTCDate();
	if (m.toString().length == 1) {
       m='0'+m;
    }
    if (d.toString().length == 1) {
       d='0'+d;
    }
	var t2 = time.getUTCFullYear()+'%2d'+m+'%2d'+d+'%20'+time.getUTCHours()+'%3a'+time.getUTCMinutes()+'%3a'+time.getUTCSeconds();
	
    var el = document.createElement("style");
    var head = document.getElementsByTagName('head')[0];
    head.appendChild(el);
    el.innerHTML =	'.us_box { border-radius: 5px; border: 5px solid #333; background: #fff;'+
					// by AshKyd
					'z-index:1000000; position: absolute; top: 70px; width: 300px; margin-left: -150px; }'+
					'.us_box h3 { cursor: move; padding: 4px 8px 4px 10px; margin: 0px; border-bottom: 1px solid #AAA; background-color: #EEE; }'+
					'.us_box h4 { margin-left: 5px; margin-bottom:0px}'+
					'#us_box_close { background-image: url(data:image/gif;base64,R0lGODlhDQANALMPAKurq7S0tOzs7MrKytfX14qKir6%2BvqWlpf7%2B%2Fnt7e5OTk56enpmZmYWFhYCAgP%2F%2F%2FyH5BAEAAA8ALAAAAAANAA0AAARd8EkxTDBDSIlI%2BGBAIBIBAMeJnsQjnEugMEqwnNRxGF0xGroBYEEcCTrEG2OpKBwFhdlyoWgae9VYoRDojQDbgKBBDhTIAHJDE3C43%2B8Ax5Co2xO8jevQSDQOGhIRADs%3D); width: 13px; height: 13px; float: right; margin-top: 1px; }'+
					'#us_box_settings { background-image: url(data:image/gif;base64,R0lGODlhDQANAPcAAAAAAHt7e4CAgIGBgYWFhYaGhoqKiouLi4yMjI2NjZOTk5mZmZqampubm5ycnJ6enp+fn6GhoaWlpaampqenp6ioqKmpqaqqqqurq6ysrK2trbCwsLKysrOzs7S0tLa2tre3t76+vr+/v8DAwMXFxcbGxsfHx8jIyMrKysvLy83NzdDQ0NTU1NXV1dfX19nZ2dzc3N3d3d7e3uDg4Ojo6Ovr6+zs7O3t7e/v7/7+/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAP8ALAAAAAANAA0AAAicAP8JtIEihIcQKGwIFJjDhYeHED24yCHQBYYMGDJy8KABg4t/NjKK/ACDRYcNGAhKuCBSBY4XJ1JIQIFhgkgPMXDcqGHiAYYFDyJgECGDRgsTIxwsAPqAgogXM1ZkYBlBwQMPBhKQcFHCQgcIEQ4Y8GCDAAEEICowaPCggFmFHgTIZTBArlwPDEME2Ms3QAiKC21IIBCAgASFAgMCADs=); width: 13px; height: 13px; float: right; margin:1px 3px 0 0; }'+
					'#us_box_head > ul, #us_box_head li { float:right}'+
					'.us_settings_grp { height:50px; vertical-align:middle; padding-right:3px;padding-left:5px}'+
					'.us_settings_grp hr { background-color: #EEE; margin: 5px 8px; height: 1px;}'+
					'.us_settings_grp_left { width:155px}'+
					'.us_settings_grp_right { width:135px}'+
					'.us_settings_grp span { vertical-align:middle}'+
					'.us_settings_grp_heading { color:#777;font-size:100%;font-weight:bold; border-bottom:1px solid #ccc; margin-bottom:4px;}'+
					'.us_settings_grp_database { cursor: help;}'+
					'#databaseMaxLength {width: 55px; }'+
					'#scrobble_at {width: 45px; }'+
					'#us_box_help { background-image: url(data:image/gif;base64,R0lGODlhDQANAKIAALKysomJisfHx%2F%2F%2F%2F5WWlujo6H5%2BfqOjoyH5BAAAAAAALAAAAAANAA0AAANCOFoi0EXJAqoFUbnDexUD1UWFx3QNkXJCRxBBkBLc%2B8ZMYNN37Os0wA8wEPowvySuaGg6nUQF4AmVLA4BQ%2BCQGSQAADs%3D); width: 13px; height: 13px; float: right; margin: 1px 3px 0 0; }'+
					'#us_loginbox_form { text-align: right; padding: 5px; }'+
					'.us_box input[type=text] { height: 16px; border: 1px solid #bbb; margin: 2px 15px 4px 2px; padding: 3px 4px; width: 170px;}'+
					'.us_box input[type=submit] { cursor:pointer; margin: 0 0 0 5px; padding: 0 4px 3px 4px; border-radius: 2px; font-size: 11px; font-weight: bold; color: white; height: 18px; border: 1px solid #3e3e3e; background-image: url(data:image/gif;base64,R0lGODlhAQAQAKIAAH5%2BflRUVFxcXGNjY2tra3Nzc3p6eoKCgiH5BAAAAAAALAAAAAABABAAAAMKeAdmVYSMIUS4CQA7); }'+
					'.us_box input[type=submit]:hover { background-image: url(data:image/gif;base64,R0lGODlhAQAQAPcAAIaGho6OjpWVlZ2dnaWlpaysrLCwsLS0tAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACwAAAAAAQAQAAAIFAAPHDBQoAABAgMGCBAQIACAhwEBADs=);}'+
					'.us_box input[type=submit]:active { padding: 1px 4px 2px 4px;}'+
					'.us_hidden { visibility: hidden; overflow: hidden; height: 0px; }'+
					'#us_hiddenform { margin: 0; pading-right: 10px;}'+
					'#us_hiddenform input[type=text] {margin-right:15px}'+
					'#us_quickchange { position:relative; bottom:40px; width:9px; height:15px; float:right; background-image: url(data:image/gif;base64,R0lGODlhCQAPAPcAAAAAAICAgIGBgYODg4SEhIeHh4iIiImJiYqKiouLi4yMjI6Ojo+Pj5CQkJGRkZeXl5iYmJmZmaCgoKKiogAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAP8ALAAAAAAJAA8AAAhMAP8J/PdgoMEDAQoY/DcggEMBAxckgBAgAgIEAhlM+Bfg3wSMBjsuFChyZMmFJ0MubCCB4z8JDgQqIEAxQgICAx3qXJgggIGRBA0GBAA7); }'+
					'#us_quickchange:focus { background-color: #FFF; outline:none}'+
					'.us_clickable_formdesc {}'+
					'.us_loadgif { text-align: center; padding: 10px 0; }'+
					'.us_loadgif img { border-radius: 5px; border:3px solid #91998E; }'+
					'#us_more { font: normal normal bold 12pt/12pt Arial; color: #999; text-decoration: none; margin-right: 3px; }'+
					'#us_more:focus { background:none; outline:none }'+
					'.us_submitbuttons { background-color: #EEE; border-top: 1px solid #AAA; padding: 5px; width: 290px; height: 18px; margin-top: 5px; }'+
					'#scrobbleStatus_parent {float: left; height: 18px; margin-left: 15px; padding-left: 5px; padding-top: 2px; color:#888}'+
					'#us_autoscrobble {vertical-align:middle;}'+
					'.us_submitbuttons_box_left {float: left;}'+
					'.us_error { background-color: #F6D8D8; border: 1px solid #f28494; padding: 5px 3px 5px 3px; width: 90%; margin: 5px auto; }'+
					'.us_done { background-color: #CCFF99; border: 1px solid #99CC00; padding: 5px 3px 5px 3px; width: 90%; margin: 5px auto; }'+
					'.us_infobox { z-index:1000000; background-color: #E8E8E8; border-radius: 5px; padding: 10px; position: fixed; right: 16px; bottom: 9px; border: 1px solid #000000; font-size: 11pt; }'+
					'.us_infobox div { color: #AAAAAA; margin: 1px 5px 0 0; float: left; }'+
					'.us_infobox div img { float: right; margin: -1px -6px 1px 8px; }'+
					'.us_infobox .sep { color:#AAA; }'+
					'.us_trackinfo { color: #47D93D; font-weight: bold; padding-right: 5px; }'+
					'.us_box .us_center { padding: 10px; text-align: center; }'+
					'.us_box .us_left { padding: 10px; text-align: left; }'+
					'#us_submit { float: right; margin-bottom:5px;}'+
					'us_submitbuttons_box_left {border}'+
					'#us_scrobblebutton { float:right; cursor: pointer; margin-left:16px;}'+
					'#us_start_scrobblebutton {padding-left:3px!important}'+ //Feather check
					'#us_icon_small, #us_start_scrobblebutton_text { vertical-align: middle;}}'+ 
					'#foundInDBIcon { }'+
					'#foundInDBIcon { float: left; height: 16px; width: 16px; cursor: help; background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOwQAADsEBuJFr7QAAABh0RVh0U29mdHdhcmUAUGFpbnQuTkVUIHYzLjM2qefiJQAAAR9JREFUOE+tk92KglAYRXuYeTUfIZUi8e9GykASQUEQBNFuvSgotETssfbMPuAZBmOcmIR99a21ksDF4h1PGIY4Ho/wfR/n8/nXkSFLR/6267qoqgp1XWPuIUOWjgw4joOyLHE6neZ8wZClIwO2baMoClyv19kAGbJ0ZMCyLOR5jtvtNhsgQ5aODJimiSzL0Pf9bIAMWToyYBgG0jQV1b+MLB0Z2Gw2iOP4pdGRgfV6jSiKXhodGVitVjgcDmJJkuDxeDwdbyNHRwZ0XUcQBGJt20JRFFwul8kfytvI0ZEBTdOw3+/Fuq4TgaZpJgHeRo6ODGy3W+x2O7FhGETgfr9PAryNnKqq34Ev8sPzPCyXS/GRUH423shwP97gP1/0J3OEY6rxN9R9AAAAAElFTkSuQmCC);}'+
					'#us_scrobble_on {font-weight:bold; color: #66CC00;} '+
					'#us_scrobble_failed {font-weight:bold; color: #D10404;} '+
					'#us_scrobble_statusbar {background-color: #66CC00; display: none; height: 2px; width: 0; opacity: 0.85; margin: -1px 0px 0px 1px} '+
					'#us_loginbox .us_status_small {color: #999; font-size:80%}';
		   //us_start_scrobblebutton
    var button = createIdElement("span","us_scrobblebutton");
		
    var classatr = document.createAttribute("class");

	button.innerHTML = '<img id="us_icon_small" style="margin-bottom: -3px;" src="'+us_icon()+'" alt="icon" /><input id="us_temp_info" video_is_playing="1" type="hidden" us_secs="'+secs+'" us_playstart_s="'+t+'" us_playstart="'+t2+'"/><input id="us_resetCore" type="button" style="display:none"/><a class="start" id="us_start_scrobblebutton"> <span id="us_start_scrobblebutton_text">Scrobble</span></a><span class="masthead-link-separator">|</span>';//postxanadus
	
	//Feather check
	if (document.getElementById("masthead-nav")) {
		BFather = document.getElementById("masthead-nav");
		BFather.insertBefore(button, BFather.firstChild);
	} else if (document.getElementById("yt-masthead-content")){
		BFather = document.getElementById("yt-masthead-content");
		button.setAttribute("class", "yt-uix-button-group");
		button.style.float = "right";
		button.style.marginLeft = "20px";
		button.style.marginTop = "3px";
		button.style.marginRight = "2px";
		button.style.borderTopRightRadius = "2px";
		button.style.borderBottomRightRadius = "2px";
		button.innerHTML = '<input id="us_temp_info" video_is_playing="1" type="hidden" us_secs="'+secs+'" us_playstart_s="'+t+'" us_playstart="'+t2+'"/><input id="us_resetCore" type="button" style="display:none"/><a style="border-radius:2px; 2px; 2px; 2px;padding-left:6px!important" class="yt-uix-button yt-uix-sessionlink start yt-uix-button-default" id="us_start_scrobblebutton"><img id="us_icon_small" src="'+us_icon()+'" alt="icon"/> <span id="us_start_scrobblebutton_text">Scrobble</span></a><div id="us_scrobble_statusbar"></div>';
		BFather.insertBefore(button, BFather.firstChild);
	} else if (document.getElementById("mh")){
		BFather = document.getElementById("mh");
		button.setAttribute("class", "ml");
		button.innerHTML = '<img id="us_icon_small" style="margin-bottom: -3px;" src="'+us_icon()+'" alt="icon" /><input id="us_temp_info" video_is_playing="1" type="hidden" us_secs="'+secs+'" us_playstart_s="'+t+'" us_playstart="'+t2+'"/><input id="us_resetCore" type="button" style="display:none"/><a class="start" id="us_start_scrobblebutton">Scrobble</a>';
		BFather.insertBefore(button, document.getElementById("se").nextSibling);
	} /* else if (location.href.indexOf("youtube.com/tv")!=-1) {
		BFather = document.getElementById("button-list");
		//button.setAttribute("class", "ml");
		button.innerHTML = '<img id="us_icon_small" style="margin-bottom: -3px;" src="'+us_icon()+'" alt="icon" /><input id="us_temp_info" video_is_playing="1" type="hidden" us_secs="'+secs+'" us_playstart_s="'+t+'" us_playstart="'+t2+'"/><input id="us_resetCore" type="button" style="display:none"/><a class="start" id="us_start_scrobblebutton">Scrobble</a>';
		BFather.insertBefore(button, document.getElementById("button-list").firstChild);
	} */ else { return; }
	getVideoSecs();
	us_buttonStatus();
	document.getElementById("us_temp_info").setAttribute("us_video_id", getYouTubeVideoId());
	addJS_Node (null, null, GM_main);
	TO3 = setInterval(function () {us_ajax_scanner()}, 5000);
	
}

function us_buttonStatus () {
    if (secs > 30) {
		document.getElementById('us_scrobblebutton').addEventListener('click', function () {us_showBox(false, true)}, true);
		us_changeOpac(100,"us_start_scrobblebutton");
		document.getElementById('us_scrobblebutton').title = "";
		tryAutoScrobble();
    } else {
		us_changeOpac(50,"us_start_scrobblebutton");
		if(secs == 0) {
			document.getElementById('us_scrobblebutton').title = "There is no video to scrobble.";
		} else {
			document.getElementById('us_scrobblebutton').title = "Video is too short to be scrobbled.";
		}
    }
	if (secs == 0) {
		setTimeout(function () {getVideoSecs();us_buttonStatus();}, 2000);
	}
}


function us_icon() { 
	if (us_getValue('us_color') == 'red') {
		return "data:image/gif;base64,R0lGODlhEAAQAKIAAPNHLdYzINJbTN2rp%2FHSztCBerIRC%2Ff39yH5BAAAAAAALAAAAAAQABAAAANQSAXczoW8Sau9LwShA9AC52nFYR6ccKLgMWxmMBxwoc2dWsy2YQSGmc93IAQIppdPOMT9SgOfKioLFIHWqK9kIhhUK%2BDwN%2F5pyui0eq1dNxMAOw%3D%3D";
	}
	else {
		return "data:image/gif;base64,R0lGODlhEAAQAKIAACUlJVVVVT4%2BPvLy8pubm1RUVHFxccnJySH5BAAAAAAALAAAAAAQABAAAANQeBbczua8Sau9T4iiRdAF52nGYA5ccaLgQGymQAywoc2dasw2AAiAmc83OAgOppdPOMT9SgSfKioTFIHWqK9kOgBUK%2BDwN%2F5pyui0eq1dNxMAOw%3D%3D";
	} 
}

// Show dialog window
// Contains either login form, or scrobble form
function us_showBox(loggedIn, forced) {
	//either create loginbox
	if (!document.getElementById('us_loginbox')) {
		var loginbox = createIdElement("div","us_loginbox");
		var classatr = document.createAttribute("class");
		classatr.nodeValue = 'us_box';
		loginbox.setAttributeNode(classatr);
		loginbox.style.opacity = 0;
		loginbox.style.MozOpacity = 0;
		loginbox.style.KhtmlOpacity = 0;
		loginbox.style.filter = "alpha(opacity=0)";
		loginbox.style.left = us_getValue('us_boxpos').split('-')[0];
		loginbox.style.top = us_getValue('us_boxpos').split('-')[1];
		document.body.insertBefore(loginbox, document.body.firstChild);
		opacity(loginbox.id, 0, 100, 500);		
      
	} //or show it
	else if (document.getElementById('us_loginbox').style.display == 'none') {
		var loginbox = document.getElementById('us_loginbox');
		loginbox.style.display = "block";
		opacity(loginbox.id, 0, 100, 500);
	} else if (forced && document.getElementById('us_loginbox').style.opacity == 1) {
		us_closebox();
	}  
	if (!isLoggedIn()) {
		var cont = '<div id="us_loginbox_form">'+
		'<div class="us_error">You are currently not logged in!</div><br />'+
		'<span>Click Login below to authenticate your account</span><br/><br/>'+
		'<span style="font-style:italic;">Note: You will leave this site and be redirected here after having logged in to Last.FM </span><br/>'+
		'<br /></div><div class="us_submitbuttons"><input id="us_submit" value="Authenticate" type="submit" /></div>';
		us_boxcontent('Login to last.fm',cont);
		
		document.getElementById('us_submit').addEventListener('click', us_authenticate, false);
	} else {
		us_scrobbleform(loggedIn);
	}
	
}

/**
*	inserts the scrobbleform into the window
*/
function us_scrobbleform(loggedIn) {
    var loginbox = document.getElementById('us_loginbox');
	
	var messageText = "";
	var notFoundText = "";
	var checkedText = "";
	var databaseFoundText = "";
	var scrobbleStatus = "";
	var feedback = getTrackInfo();
	
	var artist = decodeURIComponent(us_getTempData("artist"));
	var track = decodeURIComponent(us_getTempData("track"));
	var album = decodeURIComponent(us_getTempData("album"));
	if (artist==0 && track==0) {
		artist="";
		track="";
	}
	if (album == 0) album="";
	if (TO1Helper) {
		var restTime;
		if (us_getTempData("us_lefttoplay")) {
			restTime = us_getTempData("us_lefttoplay");
		} else {
			restTime = us_getTempData("us_secs");
		}
		scrobbleStatus = '<div id="scrobbleStatus_parent"> scrobble in <span id="scrobbleStatus" style="font-weight:bold">'+restTime+'</span> sec &nbsp;<a href="javascript:;" id="us_abortScrobbling" title="abort scrobbling">x</a></div>';
	}
	if (us_getTempData("scrobbled")==1) {
		scrobbleStatus = '<div id="scrobbleStatus_parent">scrobbled</div>';
	}
	if (loggedIn == true) {
		messageText = '<div class="us_done">Succesfully logged in</div>';
	}
	var asE = us_getTempData("autoscrobbleError");
	if (asE) {
		if (asE == "failed") {
			messageText += '<div class="us_error">AutoScrobble failed. Please scrobble manually.</div>';
		}
		if (asE == "noMusic") {
			messageText += '<div class="us_error">There was an error looking up this track on <span style="font-style:italic">Last.fm</span></div>';
		}
		if (asE == "bad") {
			messageText += '<div class="us_error">Videotitle is not in the optimal format to be scrobbled: <span style="font-style:italic">Artist - Track</span></div>';
		}
	}
	if (us_getValue("us_autoscrobble_active", 0) == 1) {
		checkedText = " checked";
	}
	if (feedback == "notFound") {
		notFoundText = '<div class="us_error">Trackinformation could not be found</div>';
	}
	if (((feedback == "found")&&(trackInfoFromDB))) {
		databaseFoundText = '<div id="foundInDBIcon" title="Trackinformation retrived from personal database"></div>';
	}
		
    var cont = '<div id="us_loginbox_form">'+databaseFoundText+messageText+'<form name="us_scrobbleform" onSubmit="return'+
                         ' false">Artist: <input type="text" name="artist" value="'+artist+'" /><br />' +
                         'Track: <input type="text" name="track" value="'+track+'" /><br/><a id="us_quickchange" title="Artist <-> Track" href="#"></a><a href="javascript:;" id="us_more" title="more options">+</a>'+
                         '<p id="us_hiddenform" class="us_hidden">Albumtitle: <input type="text" name="album" value="'+album+'" /><br />'+
                         '</p>'+notFoundText+
                         '</form></div><div class="us_submitbuttons"><div class="us_submitbuttons_box_left" title="Activate automatic scrobbling?"><input id="us_autoscrobble" name="us_autoscrobble" type="checkbox"'+checkedText+'><label for="us_autoscrobble" style="vertical-align:middle;">Auto</label></div>'+scrobbleStatus+'<input id="us_submit" value="Scrobble" type="submit" />'+
                         '</div>';
    us_boxcontent('Scrobble to last.fm - '+us_getValue('us_username'),cont);
	
	//mark & paste functionality
	if (notFoundText != "") {
		document.forms[0].elements[0].setAttribute("class", "us_clickable_formdesc"); 
		document.forms[0].elements[0].addEventListener('mousedown', function(){this.setAttribute("selecttext", window.getSelection().toString())}, false);
		document.forms[0].elements[0].addEventListener('click', function(){us_fillSelection(0, this.getAttribute("selecttext"))}, false);
		
		document.forms[0].elements[1].setAttribute("class", "us_clickable_formdesc"); 
		document.forms[0].elements[1].addEventListener('mousedown', function(){this.setAttribute("selecttext", window.getSelection().toString())}, false);
		document.forms[0].elements[1].addEventListener('click', function(){us_fillSelection(1, this.getAttribute("selecttext"))}, false);
	}
	
	document.getElementById('us_quickchange').addEventListener('click', us_quickchange, false);
    document.getElementById('us_submit').addEventListener('click', us_scrobblenp, false);
	document.getElementById('us_autoscrobble').addEventListener('click', function(){if (this.checked){us_saveValue("us_autoscrobble_active", 1)} else {us_saveValue("us_autoscrobble_active", 0)}}, false);
    document.getElementById('us_more').addEventListener('click', us_showmoreform, false);
	if (document.getElementById("us_abortScrobbling")) {
		document.getElementById("us_abortScrobbling").addEventListener('click', us_abortScrobbling, false);
	}
	if (us_getValue("us_more_options_show_or_hide") == "show") {
		us_showmoreform();
	} 	
}

//little box show info-messages
function us_infoBox(cont) {
    var inbox;
	if (!document.getElementById('us_infobox')) {
		inbox = createIdElement("div","us_infobox");
		var classatr = document.createAttribute("class");
		classatr.nodeValue = 'us_infobox';
		inbox.setAttributeNode(classatr);
		inbox.style.opacity = 0;
		inbox.style.MozOpacity = 0;
		inbox.style.KhtmlOpacity = 0;
		inbox.style.filter = "alpha(opacity=0)";
		document.body.appendChild(inbox);
        inbox = document.getElementById('us_infobox');
		opacity(inbox.id, 0, 100, 500);
	}
	else {
		inbox = document.getElementById('us_infobox');
		inbox.style.display = "block";
		inbox.style.opacity = "100";
		opacity(inbox.id, 0, 100, 500);
	}
	inbox.addEventListener("click", us_closeinfobox, false);
	inbox.style.cursor = "pointer";
	inbox.title = "Click to Close";
	inbox.innerHTML = cont;
}


//closes the box with fadeout effect
function us_closebox() {
	
	opacity('us_loginbox', 100, 0, 500);
	window.setTimeout(function() { document.getElementById('us_loginbox').style.display = "none"; }, 500);
	//document.getElementById('us_scrobblebutton').addEventListener('click', us_showBox, false);
}

//closes the info-box with fadeout effect
function us_closeinfobox() {
	opacity('us_infobox', 100, 0, 500);
	window.setTimeout(function() { document.getElementById('us_infobox').style.display = "none";}, 500);
}

//shows the optional datafiels
function us_showmoreform() {
    var i1 = document.getElementById('us_hiddenform');
    var a = document.getElementById('us_more');
    
    if (i1.getAttribute('class')) {
	   i1.setAttribute('class','');
       a.innerHTML = '&#8722;';
	   us_saveValue("us_more_options_show_or_hide", "show");
    }
    else {
       i1.setAttribute('class','us_hidden');
       a.innerHTML = '+';
	   us_saveValue("us_more_options_show_or_hide", "hide");
    }
}

/**
*	Fills window with title and content
*/
function us_boxcontent(title,content) {
	var loginbox = document.getElementById('us_loginbox');
	if (loginbox.style.display == 'none') {
		loginbox.style.display = "block";
		opacity(loginbox.id, 0, 100, 500);
	}
	var loginbox = document.getElementById('us_loginbox');
	if (!loginbox) { return false; }
	loginbox.innerHTML = '<h3 id="us_box_head">'+title+'<ul><li><a href="javascript:;" title="Close" id="us_box_close"></a></li><li><a href="javascript:;" title="Settings" id="us_box_settings"></a></li><li><a href="javascript:;" title="Help" id="us_box_help"></a></li></ul></h3>'+
	'<div>'+content+'</div>';
	document.getElementById('us_box_close').addEventListener('click', us_closebox, false);
	document.getElementById('us_box_settings').addEventListener('click', us_settings, false);
	document.getElementById('us_box_help').addEventListener('click', us_help, false);

	document.addEventListener('mousemove', us_movebox, false);
	document.getElementById('us_box_head').addEventListener('mousedown', us_moveboxd, false);
	document.getElementById('us_box_head').addEventListener('mouseup', us_moveboxu, false);
}

/**
*	Show the help-window
*/
function us_help() {
        var cont = 	'<p class="us_left">Documentation, Changelog and more can be found on the <a target="_blank" href="http://www.lukash.de/youscrobbler" title="YouScrobbler on lukash.de">YouScrobbler Projectpage</a>.</p>'+
					'<h4>Bugs</h4><p class="us_left">Bugs, Suggestions and other Questions can be posted in the <a target="_blank" href="http://www.last.fm/group/YouScrobbler/forum" title="YouScrobbler Forum">Forum</a>.</p>'+
					'<h4>Links</h4><p class="us_left"><a target="_blank" href="http://www.lukash.de/youscrobbler" title="YouScrobbler on lukash.de">YouScrobbles Projectpage</a><br/><a target="_blank" href="http://www.last.fm/group/YouScrobbler" title="Last.fm Group">Last.fm Group</a><br/><a target="_blank" href="http://userscripts.org/scripts/show/119694" title="userscripts page">Page on Userscripts.org</a><br/></p>'+
					'<h4>Info</h4><p class="us_left">powered by: <a target="_blank" href="http://www.last.fm">Last.fm</a><br/>Thanks to xanadus for the <a target="_blank" href="http://userscripts.org/scripts/show/71606" title="userscripts page">old script</a> YouScrobbler is based on.</p>';
        us_boxcontent('About - YouScrobbler '+VERSION,cont);
}
/**
*	Show the settings-window
*/
function us_settings() {
		var cmodeStatus = "";
		var maxEntries = us_getValue("database.maxEntries", 5000);
		var cont =  '<div id="us_loginbox_form" style="text-align:left"><form name="us_settings_form" onSubmit="return false"><table style="table-layout:fixed"><tr><td class="us_settings_grp us_settings_grp_left">'+
					'<div class="us_settings_grp_heading">General</div><div><input type="radio" id="us_settings_color_red" name="us_settings_color" value="red" /><label for="us_settings_color_red">Red</label><input type="radio" id="us_settings_color_black" name="us_settings_color" value="black" /><label for="us_settings_color_black">Black</label>'+ 
					'<br/><hr/><input type="checkbox" id="us_settings_asFailNotification" name="us_settings_asFailNotification"/><label for="us_settings_asFailNotification">error notification</label>'+
					'<br/><input type="checkbox" id="us_settings_scrobblingNotification" name="us_settings_scrobblingNotification"/><label for="us_settings_scrobblingNotification">scrobbling notification</label>'+
					'<br/><hr/><label for="scrobble_at">Scrobble at </label><select name="scrobble_at" id="scrobble_at"><option id="scrobble_at10" value="10">10</option><option id="scrobble_at25" value="25">25</option><option id="scrobble_at50" value="50">50</option><option id="scrobble_at75" value="75">75</option><option id="scrobble_at95" value="95">95</option></select><span>&#37;</span></div>'+
					'</td>'+
					'<td class="us_settings_grp us_settings_grp_right"><div class="us_settings_grp_heading us_settings_grp_database" title="Your custom edited track information">Database</div><span>Size: '+((us_getValue("database.id").split(" ").length) -1)+' / <select name="databaseMaxLength" id="databaseMaxLength"><option id="databaseMaxLength500" value="500">500</option><option id="databaseMaxLength5000" value="5000">5000</option><option id="databaseMaxLength-1" value="-1">unlimited</option></select></span>'+
					'<br/><br/><div class="us_settings_grp_heading">About</div>'+
					'<span>Version: '+VERSION+'</span><br/><span id="us_manualupdate"><a href="javascript:;" id="us_manualupdate_link">Check for Update</a></span></td></tr></table> '+
					'</form></div><div class="us_submitbuttons" style="text-align:right"><input type="submit" id="us_resetlogin" value="Reset Login" style="float:left"/></div>';
        
		us_boxcontent('Settings',cont);
		var us_settings_color = 'us_settings_color_' + us_getValue('us_color');
		document.getElementById(us_settings_color).setAttribute("checked", 'checked');
		if (us_getValue("asFailNotification") || us_getValue("asFailNotification")=="yes"){document.getElementById('us_settings_asFailNotification').setAttribute("checked", 'checked');}
		if (us_getValue("scrobblingNotification")){document.getElementById('us_settings_scrobblingNotification').setAttribute("checked", 'checked');}
		document.getElementById("databaseMaxLength"+us_getValue("database.maxEntries", 5000).toString()).selected = true;
		if (document.getElementById("scrobble_at"+us_getValue("scrobble_at", 75).toString())) {
			document.getElementById(("scrobble_at"+us_getValue("scrobble_at", 75).toString())).selected = true;
		} else {
			document.getElementById("scrobble_at75").selected = true;
		}
		document.getElementById('us_resetlogin').addEventListener('click', us_resetlogin, false);
		document.getElementById('us_manualupdate_link').addEventListener('click', function(){document.getElementById("us_manualupdate").innerHTML='<span class="us_status_small">checking</span>';updateCheck(true); }, false);		
		
		/**
			Save settings
		*/
		document.getElementById('us_settings_color_red').addEventListener('change', function(){
			us_saveValue("us_color", "red");
			document.getElementById('us_icon_small').src = us_icon();
		});	
		document.getElementById('us_settings_color_black').addEventListener('change', function(){
			us_saveValue("us_color", "black");
			document.getElementById('us_icon_small').src = us_icon();
		}, false);	
		document.getElementById('us_settings_asFailNotification').addEventListener('change', function(){
			us_saveValue("asFailNotification", document.getElementById("us_settings_asFailNotification").checked);
		}, false);	
		document.getElementById('us_settings_scrobblingNotification').addEventListener('change', function(){
			us_saveValue("scrobblingNotification", document.getElementById("us_settings_scrobblingNotification").checked);
		}, false);
		document.getElementById('databaseMaxLength').addEventListener('change', function(){
			var el = document.getElementById('databaseMaxLength');
			var text = el.options[el.selectedIndex].value;
			us_saveValue("database.maxEntries", text);
		}, false);	
	
		document.getElementById('scrobble_at').addEventListener('change', function(){
			var el = document.getElementById('scrobble_at');
			var text = el.options[el.selectedIndex].value;
			us_saveValue("scrobble_at", text);
		});	
}



/**
*	--- 4. Scrobbling and Login ---
*/

function isMusicVideo(infoResult, callback){
  var artist = decodeURIComponent(us_getTempData("artist")).replace(' ', '+');
  var track = decodeURIComponent(us_getTempData("track")).replace(' ', '+');
  var url = "http://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=" + APIKEY + "&artist=" + artist + "&track=" + track + "&format=json";
  GM_xmlhttpRequest({
    method: "GET",
    url: url,
    onload: function(response) {
      if(response.responseText){
        json = JSON.parse(response.responseText);
        if(json && json["track"]){
          tryAutoScrobbleCallback(infoResult, true);
          return;
        }
      }
      tryAutoScrobbleCallback(infoResult, false);
    },
    onerror: function(){
      tryAutoScrobbleCallback(infoResult, false);
    },
    ontimeout: function(){
      tryAutoScrobbleCallback(infoResult, false);
    }
  });
}

/**
* Tries to AutoScrobble video if user is logged in, its a music video and the trackinfo was found
*/
function tryAutoScrobble () {
	if (us_getValue("us_autoscrobble_active", 0) == 1) {
		var response = getTrackInfo();
		isMusicVideo(response);
	}
}

function tryAutoScrobbleCallback(response, musicVideo){
	if ((isLoggedIn())&&((trackInfoFromDB)||((response=="found")&&(musicVideo)))) {
		//save time page was loaded aka playstart time in ctime and gay format
		var time = new Date();
		var t = Math.round(time.getTime()/1000);
		var m = time.getUTCMonth()+1;
		var d = time.getUTCDate();
		if (m.toString().length == 1) {
		   m='0'+m;
		}
		if (d.toString().length == 1) {
		   d='0'+d;
		}
		var t2 = time.getUTCFullYear()+'%2d'+m+'%2d'+d+'%20'+time.getUTCHours()+'%3a'+time.getUTCMinutes()+'%3a'+time.getUTCSeconds();
		us_saveTempData("us_playstart", time.getUTCFullYear()+'%2d'+m+'%2d'+d+'%20'+time.getUTCHours()+'%3a'+time.getUTCMinutes()+'%3a'+time.getUTCSeconds());
		us_saveTempData("us_playstart_s", Math.round(time.getTime()/1000));
		us_scrobble(decodeURIComponent(us_getTempData("artist")),decodeURIComponent(us_getTempData("track")),"","",0,0,1);
		return;
	} else if (response=="bad") {
		us_saveTempData("autoscrobbleError", "bad");
		scrobble_statusbar("failed");
	} else if (!musicVideo) {
		us_saveTempData("autoscrobbleError", "noMusic");
		scrobble_statusbar("failed");
	} else {
		us_saveTempData("autoscrobbleError", "failed");
		scrobble_statusbar("failed");
	}
	if (us_getValue("asFailNotification") || us_getValue("asFailNotification")=="yes") {
		us_showBox();
	}
}

function scrobble_statusbar(status) {
	if (status=="scrobble") {
		document.getElementById("us_scrobble_statusbar").style.backgroundColor = "#66CC00";
		document.getElementById("us_scrobble_statusbar").style.display = "block";
		
	} else if (status=="failed") {
		document.getElementById("us_scrobble_statusbar").style.width = "100%";
		document.getElementById("us_scrobble_statusbar").style.display = "block";
		document.getElementById("us_scrobble_statusbar").style.backgroundColor = "#CC181E";
	} else if (status=="hide") {
		document.getElementById("us_scrobble_statusbar").style.display = "none";
		
	}
	
}


/**
 * Redirects the user to Last FM to authenticate. When they allow they will 
 * be directed back and an authentication token will be added to the URL.
 * adapted from ScrobbleSmurf
 */
function us_authenticate() {
	var tokenRegex = /(\?|&)token=[^&\?]*/gi;
	var currentURL = document.URL.replace(tokenRegex, "");
	if(!stringContainsChar(currentURL, "?")) {
		currentURL = currentURL.replace("&", "?");
	}
	var redirectURL = lastFmAuthenticationUrl + "?api_key=" + APIKEY +"&cb=" + currentURL;
	window.location.href = redirectURL;
}

/**
 * Attempts to get a Last FM token from the URL. If so authenticate the user.
 * adapted from ScrobbleSmurf and edited
 */
function tryGetAuthToken() {
	var url = currentURL;
	var tokenRegex = /(\?|&)token=[0-9a-fA-F]{32}/gi;
	var matches = url.match(tokenRegex);
	if(matches == null) {
		return;
	}
	var rawToken = matches[0];
	var token = rawToken.substring(7); //7, based on '?' or '&' and 'token='.
	GM_xmlhttpRequest({
		method: "GET",
		url: authenticationSessionUrl + "?token=" + token,
		headers: {
			"Accept": "text/html" 
		},
		onload: function(responseDetails) {
			var feedback = responseDetails.responseText;
			if ( ((feedback.indexOf("api-error"))==-1) && ((feedback.indexOf("token-error"))==-1) ) {
				var retrievedData = responseDetails.responseText.split(" - ");
				us_saveValue("us_username", retrievedData[0]);
				us_saveValue("us_sessionKey", retrievedData[1]);
				us_showBox(true);
			} else {
				us_showBox();
				us_resetlogin(feedback);
			}
		}
	});
}

/**
 * Srobbles a song using the saved track information
 */
function us_scrobble(artist,track,album,mbid,retry,queued,auto) {
	if ((us_getTempData("scrobbled"))==1 && !queued) {
		us_saveTempData("us_leftToPlay", parseInt(us_getTempData("us_secs")*(us_getValue("scrobble_at"))*0.01));
		us_saveTempData("scrobbled", 0);
	}
	var args = "?artist=" + encodeURIComponent(artist) + "&sk=" + us_getValue("us_sessionKey") + 
	"&timestamp=" + us_getTempData("us_playstart_s") + "&track=" + encodeURIComponent(track) + "&duration=" + secs;
	if (album != 0 && album != "") {
		album==false;
		args += "&album=" + encodeURIComponent(album);
	}
	if (mbid != 0 && mbid != "") {
		mbid==false;
		args +=  "&mbid=" + encodeURIComponent(mbid);
	}
	var time_left_to_scrobble = us_getTempData("us_leftToPlay");
	
    if (time_left_to_scrobble > 0) {
		TO1Helper = true;
		if (retry==0) {
			if (auto==1 && us_getValue("scrobblingNotification")) {
				us_infoBox('<div><span class="us_trackinfo"><span id="us_artist_display">'+artist+ '</span> <span class="sep">-</span> <span id="us_track_display">' +track+'</span></span> scrobbling in '+time_left_to_scrobble+' seconds. <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAACXBIWXMAAA7CAAAOwgEVKEqAAAAAGnRFWHRTb2Z0d2FyZQBQYWludC5ORVQgdjMuNS4xMDD0cqEAAAG4SURBVDhPdVNNS0JREL19mAV9LSRo4zqEfoK0FCKiKCyqRQuhFK2HEBRSEPmkTBCjRdHGZRD9idb2uRBavMC30EJwlW4iXnN0roxFA4d7OXPO3LlfSsbnd91z9p4xlq3Zu8Cr35EAhxw0LO+Ml8aTf9WaL0BMYzFZ3jfjdsQ07E0Tc3CcK0DLtlaAWLSmsVLVcZw9QjdhKW6HCwDNw8zloYG2XaT2VfOsWHNYGeYsoYugYBAF+pnrIWShhQdela4kDbRGcU7QZmBUFJgUPHACD7xq296orr8Fi0QOcxKrYHSLAmhfFnDBA69qVTrCvkcIsoPoPwXchBx5THibBShcnAS0OB0thXQBnA06G+Ic4JMFBkUCcOWrl80VKFKEPuYDPALedgG0Q4TeO7aRAL9mLYD3MO8jeHm+SwfY2sJWKaQPcYyTA0hkKim0fk3QV6gPGZiAB155jTeEXkJkx47d0iivVe4dXIA7N34/pEMCbgOt6i39xhS07YeEeG48yKecYKG8GayKrVxBAy08TbOOx/q9/EwXZvkAB3hMGKd5TH4maNnWGfiquY9TI2jN/PnO4JDr/M5K/QDEQYmHdixexAAAAABJRU5ErkJggg==" alt="queued" /></div>');
				window.setTimeout(function() { us_closeinfobox();}, 5000);
			} else if (us_getValue("scrobblingNotification")){
				us_boxcontent('Queued...','<div class="us_done">This will be scrobbled in '+time_left_to_scrobble+' seconds. </div>');
				window.setTimeout(function() { us_closebox(); }, 2000);
			}
		}
	}
    else {
		TO1Helper = false;
        if (queued != 1) {
			us_boxcontent('Scrobbling...',loadgif);
        }
        clearTimeout(TO1);
		GM_xmlhttpRequest({
			method: "GET",
			url: scrobbleSongUrl + args,
			onload: function(responseDetails) { scrobbleFeedback (responseDetails, artist, track, queued) },
			onerror: 	
				function() {GM_xmlhttpRequest({
					method: "GET",
					url: altScrobbleSongUrl + args,
					onload: function(responseDetails) { scrobbleFeedback (responseDetails, artist, track, queued) },
					onerror: function() {
						us_infoBox('<div class="us_error">Servererror</div>');
						window.setTimeout(function() { us_closeinfobox(); }, 10000);
					}
				});}
		}); 
	}
}


 
/**	
*	Feedback of scrobbleing
*/
function scrobbleFeedback (responseDetails, artist, track, queued) {
	var feedback = responseDetails.responseText;
	var loginbox = document.getElementById('us_loginbox');
	if ((feedback.indexOf('<lfm status="ok"'))!=-1) {
		us_saveTempData("scrobbled", 1);
		TO1Helper=false;
		if (document.getElementById("scrobbleStatus_parent")) {
			document.getElementById("scrobbleStatus_parent").innerHTML = "scrobbled";
		}
		if (queued != 1) {
		   us_boxcontent('OK!','<div class="us_done"><span class="us_trackinfo"><span id="us_artist_display">'+artist+ '</span> <span class="sep">-</span> <span id="us_track_display">' +track+'</span></span> scrobbled.</div>');
		   window.setTimeout(function() { us_closebox(); }, 2000);
		}
		else {
		   /* TODO us_infoBox('<div><span class="us_trackinfo">'+artist+' <span class="sep">-</span> '+track+'</span> scrobbled. <img src="data:image/gif;base64,R0lGODlhEAAQAKIAAO7w7qrZnHXGZnC6WJLJhE%2BpODGCLbrfsyH5BAAAAAAALAAAAAAQABAAAANhCLrcHmKUEZw6g4YtT8PEERBEcBCFtwyh4L5nsQTD8cLCURCKducKkgxQgACBAIIgYFAUXQ3CYNkkjgS8YIZUpdlYyQxlt9jRxBla9WLIKVlq1eJgMI8KBnnUwDdkLYAMCQA7" alt="done" /></div>');
		   window.setTimeout(function() { us_closeinfobox(); }, 3000); */
		}
	} else {	
			if (queued != 1) {
				us_boxcontent('Error','<div class="us_error">'+feedback+'</div>');
			}
			else {
				us_infoBox('<div class="us_error">Error: '+feedback+'</div>');
			}
	}           		
}

/**
*	Temporary save track information from the form 
*/
function us_scrobblenp(retry) {
	var formArtist = document.forms[0].elements[0].value;
	var formTrack = document.forms[0].elements[1].value;
	var formAlbum = document.forms[0].elements[2].value;
	if ((formArtist!="") && (formTrack!="")) {
		if (formArtist!=decodeURIComponent(us_getTempData("artist")) || formTrack!=decodeURIComponent(us_getTempData("track")) || formAlbum!=decodeURIComponent(us_getTempData("album"))) {
			saveDatabaseData(getYouTubeVideoId(), formArtist, formTrack, formAlbum);
		}
		us_saveTempData("artist", encodeURIComponent(formArtist));
		us_saveTempData("track", encodeURIComponent(formTrack));
		if (!formAlbum) { var formAlbum = ''; } else {us_saveTempData("album", encodeURIComponent(formAlbum));}
		
		us_scrobble(decodeURIComponent(us_getTempData("artist")),decodeURIComponent(us_getTempData("track")),formAlbum,"",0,0,0);
	} //empty input
}

/**
*	Abort scrobbling process
*/
function us_abortScrobbling () {
	if (TO1Helper) {
		try { clearTimeout(TO1); } catch (e) {console.log(e);} 
		TO1Helper = false;
		if (document.getElementById("scrobbleStatus_parent")) {
			var element = document.getElementById("scrobbleStatus_parent");
			element.parentNode.removeChild(element);
		}
		
	}
	scrobble_statusbar("hide");
}

/**
*	Unset the saved login info + show login form, and maybe show errors
*/
function us_resetlogin(error) {
	us_saveValue('us_username','');
	us_saveValue('us_sessionKey','');
	var cont = '';
	var resetInfo = "";
	if (!error) {
		resetInfo = '<div class="us_done">Succesfully reseted login-data</div><br />';
	}
	if ((error != '[object MouseEvent]') && (error != '[object XPCNativeWrapper [object MouseEvent]]')) { cont = '<p class="us_error">Error: '+error+'</p>'; }
	cont = cont+'<div id="us_loginbox_form">'+
		resetInfo+
		'<span>Click Login below to authenticate your account</span><br/><br/>'+
		'<span style="font-style:italic;">Note: You will leave this site and be redirected here after having logged in to Last.FM </span><br/><br /></div><div class="us_submitbuttons"><input id="us_submit" value="Authenticate" type="submit" /></div>';
	us_boxcontent('Login to last.fm',cont);
	document.getElementById('us_submit').addEventListener('click', us_authenticate, false);
}



/**
*	--- 5. Information request ---
*/

/**
 * Check whether user credentials are stored or not.
 */
function isLoggedIn() {
	if((us_getValue("us_username") == "") || (!us_getValue("us_username")) || (us_getValue("us_sessionKey") == "") || (!us_getValue("us_sessionKey"))) {
		return false;
	}
	return true;
}

/**
* Check if a video is a music video. Via link-href due to performance reasons (and not YouTube-Api)
*/
function isMusicCategory () {
	if ((document.getElementById("eow-category"))) {
		if (document.getElementById("eow-category").getElementsByTagName("a")[0].getAttribute("href") == "/music") {
			return true;
		} else {
			return false;
		}
	} else {
		return false;
	}
}

/**
*	Gets the current YouTube video ID from the browser URL.
*	adapted from ScrobbleSmurf
*/
function getYouTubeVideoId () {
	var regex = /(\?|%3F|&|%26)v=[^\?&#]*/gi;
	var matches = document.URL.match(regex);
	if(matches == null) {
		return null;
	}
	var removeRegex = /(\?|%3F|&|%26)v=/gi;
	var vidId = matches[0].replace(removeRegex, "");
	return vidId;
}

/**
* 	Detects the trackinformation from the video title and temporarily saves it
*/
function getTrackInfo(){
	var feedback;
	if ((us_getTempData("artist")!=0) || (us_getTempData("track")!=0)) {
		feedback = "found";
	} else {
		var titleContentOriginal;
		if (location.href.indexOf("youtube.com/user/") != -1) {
			if (document.getElementById("playnav-curvideo-title")) {
				titleContentOriginal = document.getElementById("playnav-curvideo-title").getElementsByTagName("a")[0].textContent;
			} else if (document.getElementsByClassName("channels-featured-video-details tile")[0]) {
				titleContentOriginal = document.getElementsByClassName("channels-featured-video-details tile")[0].getElementsByTagName("a")[0].textContent;
			}
		} /* else if (location.href.indexOf("youtube.com/tv") != -1) {
			//Feather check
			if (document.getElementById("player-video-title")) {
				var titleContentOriginal = document.getElementById("player-video-title").textContent;
			} 
		} */ else {
			//Feather check
			if (document.getElementById("eow-title")) {
				var titleContentOriginal = document.getElementById("eow-title").textContent;
			} else if (document.getElementById("watch-headline-title")) {
				var titleContentOriginal = document.getElementById("watch-headline-title").textContent;
			} else if (document.getElementById("vt")) {
				var titleContentOriginal = document.getElementById("vt").textContent;
			}
		}
		//Retrive trackinformation from database
		if (getDatabaseData()==true) {
			feedback = "found";
			trackInfoFromDB = true;
		} else {
			//New detection of trackinformation
						
			//remove (*) and/or [*] to remove unimportant data
			var titleContent = titleContentOriginal.replace(/ *\([^)]*\) */g, '');
			titleContent = titleContent.replace(/ *\[[^)]*\] */g, '');
			
			//remove HD info
			titleContent = titleContent.replace(/\W* HD( \W*)?/, '');
			titleContent = titleContent.replace(/\W* HQ( \W*)?/, '');
			
			//get remix info
			var remixInfo = titleContentOriginal.match(/\([^)]*(?:remix|mix|cover|version|edit|booty?leg)\)/i);
					
			var musicInfo = titleContent.split(" - ");
			if (musicInfo.length == 1) {
				musicInfo = titleContent.split("-");
			}
			if (musicInfo.length == 1) {
				musicInfo = titleContent.split(":");
			}
			if (musicInfo.length == 1) {
				musicInfo = titleContent.split(' "');
			}
			
			//format feat. info
			for (var i=0;i<musicInfo.length;i++) {
				musicInfo[i] = musicInfo[i].replace(/ feat. /, ' feat. ');
				musicInfo[i] = musicInfo[i].replace(/ feat /, ' feat. ');
				musicInfo[i] = musicInfo[i].replace(/ ft. /, ' feat. ');
				musicInfo[i] = musicInfo[i].replace(/ ft /, ' feat. ');
				
			}
			
			//remove " and ' from musicInfo
			for (var i=0;i<musicInfo.length;i++) {
				musicInfo[i] = musicInfo[i].replace(/^\s*"|"\s*$/g, '');
				musicInfo[i] = musicInfo[i].replace(/^\s*'|'\s*$/g, '');
			}
						
			if ((musicInfo.length == 1)||(musicInfo[0] == false) || (musicInfo[1] == false)) {
				musicInfo[0] = "";
				musicInfo[1] = "";
				feedback = "notFound";
			} else {				
				feedback = "found";
			}
			
			//delete spaces
			//musicInfo[0] = "    " + musicInfo[0] + "    ";
			musicInfo[0] = musicInfo[0].replace(/^\s\s*/, '').replace(/\s\s*$/, '');
			musicInfo[1] = musicInfo[1].replace(/^\s\s*/, '').replace(/\s\s*$/, '');
			
			musicInfo[1] = musicInfo[1].replace(/(\.avi)$/gi, '');
			musicInfo[1] = musicInfo[1].replace(/(\.wmv)$/gi, '');
			musicInfo[1] = musicInfo[1].replace(/(\.mp4)$/gi, '');
			musicInfo[1] = musicInfo[1].replace(/(\.mpeg4)$/gi, '');
			musicInfo[1] = musicInfo[1].replace(/(\.mov)$/gi, '');
			musicInfo[1] = musicInfo[1].replace(/(\.3gpp)$/gi, '');
			musicInfo[1] = musicInfo[1].replace(/(\.flv)$/gi, '');
			musicInfo[1] = musicInfo[1].replace(/(\.webm)$/gi, '');
			
			//move feat. info
			if (musicInfo[0].match(/ feat.* .*/)) {
				musicInfo[1] = musicInfo[1] + musicInfo[0].match(/ feat.* .*/);
				musicInfo[0] = musicInfo[0].replace(/ feat.* .*/, '');
			}
			//add remix info
			if(remixInfo && remixInfo.length == 1){
			  musicInfo[1] += " " + remixInfo[0];
			}			
			if (us_getValue("us_autoscrobble_active", 0) == 1) {
				if ((musicInfo.length != 2)) {
					feedback = "bad";
				}
			}
			
			
			if (!us_getTempData("artist")) {
				us_saveTempData("artist", encodeURIComponent(musicInfo[0]));
			}
			if (!us_getTempData("track")) {
				us_saveTempData("track", encodeURIComponent(musicInfo[1]));
			}
		}
		//Full Album Video
		/* if (titleContentOriginal.match(/Full Album/i)) {
			var album = getAlbumInfo();
			//album = JSON.parse(json);
			console.debug(album);
			alert(" "+album.name);
			if (us_getTempData("full_album_track_nr", 0) == 0 && album.name == decodeURIComponent(us_getTempData("track"))) {
				us_saveTempData("full_album_track_nr", 1);
			}
			us_saveTempData("artist", album.track[us_getTempData("full_album_track_nr")].artist.name);
			us_saveTempData("track", album.track[us_getTempData("full_album_track_nr")].name);			
		}  */
	}
	return feedback;
}

/**
* 	fetchs full ablum info from last.fm api
*/
/* function getAlbumInfo(){
	alert("getAlbumInfo");
	var artist = decodeURIComponent(us_getTempData("artist")).replace(' ', '+');
	var albumName = decodeURIComponent(us_getTempData("track")).replace(' ', '+');
	var url = "http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=" + APIKEY + "&artist=" + artist + "&album=" + albumName + "&format=json";
	GM_xmlhttpRequest({
		method: "GET",
		url: url,
		onload: function(response) {
		  if(response.responseText){
			//var json = JSON.parse(response.responseText);
			var response = response.responseText;
			//return response;
			var json = eval('(' + response.responseText + ')');
			console.debug(json);
			//album = json.album;
			album = json;
			//tracks = album.tracks;
			if(json){
				alert(tracks.track[0].name);
				console.debug(tracks);
				console.debug(tracks.track[0].name);
				console.debug(tracks.track.length); 
				//alert(); 
			
				return album;
			} 
		  }
		},
		onerror: function(){
			alert("failed");
		},
		ontimeout: function(){
		  tryAutoScrobbleCallback(infoResult, false);
		}
	});
} */


/**
*	database trackinformation
*/
function getDatabaseData () {
	var id = getYouTubeVideoId();
	if ((us_getValue("database.id", 0)!=0) && (us_getValue("database.id", 0).search(id) != -1)) {
		var ids = us_getValue("database.id", 0).split(" ");
		var artists = us_getValue("database.artist", 0).split(" ");
		var tracks = us_getValue("database.track", 0).split(" ");
		var index = 0;
		for (var i=0;i<ids.length;i++) {
			if (ids[i]==id) {
				index=i;
				i=ids.length;
			}
		}
		if (!us_getTempData("artist")) {
			us_saveTempData("artist", artists[index]);
		}
		if (!us_getTempData("track")) {
			us_saveTempData("track", tracks[index]);
		}
		ids.splice(ids.length,0,ids[index]);
		ids.splice(index,1);
		artists.splice(artists.length,0,artists[index]);
		artists.splice(index,1);
		tracks.splice(tracks.length,0,tracks[index]);
		tracks.splice(index,1);
		us_saveValue("database.id", ids.join(" "));
		us_saveValue("database.artist", artists.join(" "));
		us_saveValue("database.track", tracks.join(" "));
		//retrive Album title
		if (us_getValue("database_additional.id", 0).search(id) != -1) {
			var Aids = us_getValue("database_additional.id", 0).split(" ");
			var albumtitles = us_getValue("database_additional.albumtitle", 0).split(" ");
			var index = 0;
			for (var i=0;i<Aids.length;i++) {
				if (Aids[i]==id) {
					index=i;
					i=Aids.length;
				}
			}
			if (!us_getTempData("album")) {
				us_saveTempData("album", albumtitles[index]);
			}
		}
		return true;
	}
	else {
		return false;
	}
}

function saveDatabaseData(id, artist, track, album, mbid) {
	//Edit existing entry
	if ((us_getValue("database.id", 0)!=0) && (us_getValue("database.id", 0).search(id) != -1)) {
		var ids = us_getValue("database.id", 0).split(" ");
		var artists = us_getValue("database.artist", 0).split(" ");
		var tracks = us_getValue("database.track", 0).split(" ");				
		var index = 0;
		for (var i=0;i<ids.length;i++) {
			if (ids[i]==id) {
				index=i;
				i=ids.length;
			}
		}
		ids.splice(ids.length,0,ids[index]);
		ids.splice(index,1);
		artists.splice(artists.length,0,encodeURIComponent(artist));
		artists.splice(index,1);
		tracks.splice(tracks.length,0,encodeURIComponent(track));
		tracks.splice(index,1);
		us_saveValue("database.id", ids.join(" "));
		us_saveValue("database.artist", artists.join(" "));
		us_saveValue("database.track", tracks.join(" "));
	} else {
	//New entry
		var ids = us_getValue("database.id", 0).split(" ");
		if ((us_getValue("database.maxEntries", 5000)=="-1")||(ids.length<us_getValue("database.maxEntries", 5000))) {
			//New Entry
			us_saveValue("database.id", (us_getValue("database.id", 0)+" "+id));
			us_saveValue("database.artist", (us_getValue("database.artist", 0)+" "+encodeURIComponent(artist)));
			us_saveValue("database.track", (us_getValue("database.track", 0)+" "+encodeURIComponent(track)));
		} else {
			//Already maximum number of entries -> delete oldest and insert new
			var artists = us_getValue("database.artist", 0).split(" ");
			var tracks = us_getValue("database.track", 0).split(" ");
			ids.splice(ids.length,0,id);
			ids.splice(0,1);
			artists.splice(artists.length,0,encodeURIComponent(artist));
			artists.splice(0,1);
			tracks.splice(tracks.length,0,encodeURIComponent(track));
			tracks.splice(0,1);
			us_saveValue("database.id", ids.join(" "));
			us_saveValue("database.artist", artists.join(" "));
			us_saveValue("database.track", tracks.join(" "));
		}
	}
	
	//Save additional information about the track (Albumtitle)
	if (album!=0) {
		if ((us_getValue("database_additional.id", 0)!=0) && (us_getValue("database_additional.id", 0).search(id) != -1)) {
			var Aids = us_getValue("database_additional.id", 0).split(" ");
			var albumtitles = us_getValue("database_additional.albumtitle", 0).split(" ");
			var index = 0;
			for (var i=0;i<Aids.length;i++) {
				if (Aids[i]==id) {
					index=i;
					i=Aids.length;
				}
			}
			Aids.splice(Aids.length,0,id);
			Aids.splice(index,1);
			albumtitles.splice(albumtitles.length,0,encodeURIComponent(album));
			albumtitles.splice(index,1);
			us_saveValue("database_additional.id", Aids.join(" "));
			us_saveValue("database_additional.albumtitle", albumtitles.join(" "));
		} else {
			us_saveValue("database_additional.id", us_getValue("database_additional.id", "") + " " + encodeURIComponent(id));
			us_saveValue("database_additional.albumtitle", us_getValue("database_additional.albumtitle", "") + " " + encodeURIComponent(album));
		}		
	}
}

/**
*	Gets the Video-Length in seconds 1. from the video and if failed 2. from the YouTube-Api
*/
function getVideoSecs () {
	//var metaDur = document.querySelectorAll("div#watch7-content meta[itemprop=duration]")[0].content;
	
		var vidId = getYouTubeVideoId();
		GM_xmlhttpRequest({
			method: "GET",
			url: youtubeApiUrl + vidId + "?v=2&alt=jsonc",
			headers: {
				"Accept": "application/json"
			},
			onload: function(response) {
				var jsonObject = eval("(" + response.responseText + ")");
				secs = Math.round(jsonObject.data.duration);
				us_saveTempData("us_secs", secs);
				//watched seconds till scrobbling
				var time_left_to_scrobble;
				if (us_getTempData("us_leftToPlay", false)==false || us_getTempData("us_leftToPlay") < 0){
					time_left_to_scrobble = parseInt(us_getTempData("us_secs")*(us_getValue("scrobble_at"))*0.01);
					us_saveTempData("us_leftToPlay", parseInt(time_left_to_scrobble));
				}
				
			},
			onerror: function() {
				console.log("Could not connect to YouTube-API");
			}
		});
	
	
	return secs;
}



/**
*	--- 6. Miscellaneous ---
*/
/**
*	
*
*/
function us_ajax_scanner (currentAlbumTrack) {
	//increase played time by 1 second
	var leftToPlay = us_getTempData("us_leftToPlay");
	if (us_getTempData("video_is_playing", 0) == 1 && us_getTempData("us_reset_now")!="1" && leftToPlay >= 1) {
		us_saveTempData("us_leftToPlay", parseInt(leftToPlay-5));
		if (document.getElementById("scrobbleStatus")) {
			document.getElementById("scrobbleStatus").innerHTML = leftToPlay-5;
		}
		
		if (TO1Helper) {
			scrobble_statusbar("scrobble");
			document.getElementById("us_scrobble_statusbar").style.width = Math.round(100-100*(leftToPlay/(us_getTempData("us_secs")*(us_getValue("scrobble_at"))*0.01)))+"%";
		} 
	}
	
	if (us_getTempData("video_end_reached") == "yes" && us_getTempData("video_is_playing", 0) == 1) {
		us_saveTempData("us_reset_now", "1");
		us_saveTempData("video_end_reached", 0);
	}
	if (!getYouTubeVideoId()) {
		us_saveTempData("us_reset_now", "1");
	}
	leftToPlay = us_getTempData("us_leftToPlay");
	if (leftToPlay <= 0 && us_getTempData("scrobbled") != 1 && TO1Helper) {
		
		if (document.getElementById("scrobbleStatus")) {
			document.getElementById("scrobbleStatus_parent").innerHTML = "submitting...";
		}
		us_scrobble(decodeURIComponent(us_getTempData("artist")), decodeURIComponent(us_getTempData("track")), decodeURIComponent(us_getTempData("album")), decodeURIComponent(us_getTempData("mbid")), 0, 1, 1);
		if (is_full_album = "yes") {
			//TODO us_getTempData("artist");us_getTempData("track")), decodeURIComponent(us_getTempData("album")), decodeURIComponent(us_getTempData("mbid")), 0, 1, 1);
			us_saveTempData("full_album_track_nr", us_getTempData("full_album_track_nr")+1);
		}
	}
	//check for reset -> ajax youtube change
	if (us_getTempData("us_reset_now")=="1") {
		us_saveTempData("us_reset_now", "0");
		us_reset();
	}
}

/**
*	Quickchange artist <-> track in scrobble-form
*/
function us_quickchange() {
	var artist = document.forms[0].elements[0].value;
	document.forms[0].elements[0].value = document.forms[0].elements[1].value;
	document.forms[0].elements[1].value = artist;
} 

/**
*	temporary saves data in forms attributes
*	used for Quickchange
*/
function us_fillSelection (object, content) {
	if (content != "") {
		document.forms[0].elements[object].setAttribute("value", content);
	}
}

/**
*	Checks if its first run or if updated
*/
function checkFirstRun () {
	var localVersion = us_getValue("us_local_version", 0);
	if (localVersion == 0) {
		initPreferences();
		us_showBox();
		var cont = '<div id="us_loginbox_form">'+
		'<h4>Welcome to YouScrobbler!</h4><br/>'+
		'<span>Join the <a target="_blank" href="http://www.last.fm/group/YouScrobbler">Last.fm Group</a> to stay up to date.</span><br/><br/>'+
		'<span>Description and documentation can be found on the <a target="_blank" href="http://www.lukash.de/youscrobbler">Homepage</a>.</span><br/><br/>'+
		'</div><div class="us_submitbuttons"><input id="us_submit" value="Next" type="submit" /></div>';
		us_boxcontent('First Run',cont);
		document.getElementById('us_submit').addEventListener('click', us_showBox, false);
		us_saveValue("us_local_version", VERSION);
	} else if (localVersion < VERSION) {
		us_showBox();
		var cont = '<div id="us_loginbox_form">'+
		'<div class="us_done">Welcome to YouScrobbler  '+VERSION+'.</div><br/>'+
		'<span>Changelog can be found on the <a target="_blank" href="http://www.lukash.de/youscrobbler">Webpage</a>.</span><br/>'+
		'<br/>'+
		'<br/>'+
		'<h4>Join the <a target="_blank" href="http://www.last.fm/group/YouScrobbler" title="Last.fm Group">Last.fm Group</a> to stay tuned</h4>'+
		'<br /></div><div class="us_submitbuttons"><input id="us_submit" value="Close" type="submit" /></div>';
		us_boxcontent('Succesfully Updated',cont);
		document.getElementById('us_submit').addEventListener('click', us_closebox, false);
		us_saveValue("us_local_version", VERSION);
	}
}



/**
*	--- 7. Third party functions ---
*/

/**
 * Checks whether a text contains a character.
 * adapted from ScrobbleSmurf
 */
function stringContainsChar(text, charac) {
	for(var i = 0; i < text.length; i++) {
		if(text[i] == charac) {
			return true;
		}
	}
	return false;
}

//change the opacity for different browsers
function us_changeOpac(opacity, id) {
    var object = document.getElementById(id).style;
    object.opacity = (opacity / 100);
}

function opacity(id, opacStart, opacEnd, millisec) {
	//speed for each frame
	var speed = Math.round(millisec / 250); //100
	var timer = 1;
	//determine the direction for the blending, if start and end are the same nothing happens
	if(opacStart > opacEnd) {
		for(var i = opacStart; i >= opacEnd; i--) {
			window.setTimeout(function(b) { return function() { us_changeOpac(b, id); } }(i),(timer * speed));
			timer++;
		}
	} else if(opacStart < opacEnd) {
		for(var i = opacStart; i <= opacEnd; i++) {
			window.setTimeout(function(b) { return function() { us_changeOpac(b, id); } }(i),speed*timer);
			timer++;
		}
	}	
}
//
// http://www.somacon.com/p355.php
//
String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g,"");
}
String.prototype.ltrim = function() {
	return this.replace(/^\s+/,"");
}
String.prototype.rtrim = function() {
	return this.replace(/\s+$/,"");
}


/**
*	--- 8. Update ---
*
*	Edited version of Script Update Checker (http://userscripts.org/scripts/show/20145)
*/
function updateCheck(forced)
{
	var update_interval = 154200000;
	if ((forced) || ((parseInt(us_getValue('us_last_update', '0')) + update_interval) <= parseInt(((new Date()).getTime())))) // Checks every day (24 h * 60 m * 60 s * 1000 ms)
	{
		try
		{
			GM_xmlhttpRequest(
			{
				method: 'GET',
				url: updateUrl(),
				onload: function(resp)
				{
					var local_version, remote_version, response;
					response=resp.responseText;
					us_saveValue('us_last_update', new Date().getTime()+'');
					remote_version=response.split(" ")[0];
					local_version=VERSION;						
					if (remote_version > local_version)
					{
						if (functionsLoaded!=true) {
							if (confirm("Error occured. Install Update?")) {
								window.location = scriptDownloadUrl();
							}
						}
						var cont =  '<div id="us_loginbox_form"><span>YouScrobbler '+ String(remote_version) +' is available.</span><br/>'+
									'<span>Changes are applied after new page load.</span><br/>'+
									'<br/>'+
									'Problem updating?<br/>'+									
									'Try via Greasemonkey (Addons/UserScripts)'+
									'</div><div class="us_submitbuttons"><input id="us_submit" value="Install Update" type="submit" /></div>';
						us_showBox();
						us_boxcontent('Update available',cont);
						document.getElementById('us_submit').addEventListener('click', function(){window.open(scriptDownloadUrl(), "_blank");}, false);
					}
					else if (forced) {
						document.getElementById("us_manualupdate").firstChild.innerHTML = "No Update available";
					}
				},
				onerror: function () {
					if ((forced)) {
						var cont =  '<div id="us_loginbox_form"><div class="us_error">Checking for an update has failed. Try again later.</div><br/>'+
									'<br/>'+
									'<br/>'+
									'</div><div class="us_submitbuttons"><input id="us_submit" value="Check again" type="submit" /></div>';
						us_showBox();
						us_boxcontent('Updatecheck failed',cont);
						document.getElementById('us_submit').addEventListener('click', function(){updateCheck(true);}, false);
					} else {
						us_infoBox('<div class="us_error">Updatecheck failed</div>');
						window.setTimeout(function() { us_closeinfobox(); }, 5000);
					}						
				}
			});
		}
		catch (err)
		{
			if ((forced)) {
						var cont =  '<div id="us_loginbox_form"><div class="us_error">Checking for an Updated has failed. Try again later.<br/>Error:<br/>'+
									err+'</div><br/>'+
									'<br/>'+
									'<br/>'+
									'</div><div class="us_submitbuttons"><input id="us_submit" value="Check again" type="submit" /></div>';
						us_showBox();
						us_boxcontent('Updatecheck failed',cont);
						document.getElementById('us_submit').addEventListener('click', function(){updateCheck(true);}, false);
			} else {
				us_infoBox('<div class="us_error">Updatecheck failed: '+err+'</div>');
				window.setTimeout(function() { us_closeinfobox(); }, 5000);
			}
		}
	}
	if (functionsLoaded!=true) {
		if (confirm("Error occured. Install newest Version?")) {
			window.location = scriptDownloadUrl();
		}
	}
}

functionsLoaded = true;

try {
	init(); //run YouScrobbler
	
} 
catch (err)
{
	console.log(err);
} 
updateCheck(false);
