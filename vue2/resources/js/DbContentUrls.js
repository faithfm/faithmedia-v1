
// EXPORTS

// DEPENDENCY NOTE: We are expecting three config constants from our Laravel myapp.php config-file, passed to Vue as LaravelAppGlobals via our Blade template.

// main file downloaded by playout systems and logged in the content db
export function oggUrl(dbPathname, config) {
    return dbUrlEncode(config.media_download_base.ogg + dbPathname)
}
// low-quality MP3 file played by web+app listeners:
export function mp3Url(dbPathname, config) {
    return dbUrlEncode((config.media_download_base.mp3 + dbPathname).replace(".ogg", ".mp3"))
}
// in cases where a non-compressed "original" file is available (ie: music libary), it is located at...
export function origUrl(dbPathname, config) {
    return dbUrlEncode((config.media_download_base.orig + dbPathname).replace(/\/([^\/]+)$/, '/originals/$1').replace(".ogg", ".mp3"))
}


// INTERNAL FUNCTIONS

// **** URL generators ****
function dbUrlEncode(dbPathname) {
    // Use special cloudfront dist for paths containing 'ads' to prevent ad blockers blocking it:
    dbPathname = dbPathname.replace('content96k.faithfm.com.au/ads/stationads/', 'content96k-link2.faithfm.com.au/');
    dbPathname = dbPathname.replace('content96k.faithfm.com.au/ads/', 'content96k-link1.faithfm.com.au/');

    // manually url-encode any '+' characters
	return dbPathname.replace(/\+/g, "%2B")
}


