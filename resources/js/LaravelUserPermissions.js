// DEPENDENCY NOTE: We are expecting LaravelAppGlobals.users.permissions from our Laravel app, passed in via our Blade template.

// return true if user has the specified permission - ie: "use-app"
export function laravelUserCan(permissionToCheck) {
    return LaravelAppGlobals.user.permissions.some(p => p.permission===permissionToCheck);
}

// return any restrictions associated with the specified permission
export function laravelUserRestrictions(permissionToCheck) {
    const perm = LaravelAppGlobals.user.permissions.find(p => p.permission===permissionToCheck);
    if (perm === undefined)   return { status:"NOT PERMITTED" }
    if (!perm.restrictions )  return { status:"ALL PERMITTED" }
    try { return  { status:"SOME PERMITTED", ...JSON.parse(perm.restrictions) } }
    catch { return { status:"NOT PERMITTED", error:"INVALID JSON", json:perm.restricitons } }
}
