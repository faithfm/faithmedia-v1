
// EXPORTS

// DEPENDENCY NOTE: We are expecting three config constants ("MEDIA_DOWNLOAD_BASE_XXX") from our Laravel .env file, passed in via our Blade template.

// main file downloaded by playout systems and logged in the content db
export function oggUrl(dbPathname, config) {
    return dbUrlEncode(config.MEDIA_DOWNLOAD_BASE_OGG + dbPathname)
}
// low-quality MP3 file played by web+app listeners:
export function mp3Url(dbPathname, config) {
    return dbUrlEncode((config.MEDIA_DOWNLOAD_BASE_MP3 + dbPathname).replace(".ogg", ".mp3"))
}
// in cases where a non-compressed "original" file is available (ie: music libary), it is located at...
export function origUrl(dbPathname, config) {
    return dbUrlEncode((config.MEDIA_DOWNLOAD_BASE_ORIG + dbPathname).replace(/\/([^\/]+)$/, '/originals/$1').replace(".ogg", ".mp3"))
}


// INTERNAL FUNCTIONS

// **** URL generators ****
function dbUrlEncode(dbPathname) {
	return dbPathname.replace(/\+/g, "%2B")
}


