/**
 * This file is published from the "faithfm/laravel-simple-permissions" composer package.
 *    WARNING: Local modifications will be overwritten if the package is published during updates.
 *             See https://github.com/faithfm/laravel-simple-permissions for more details.
 */

// DEPENDENCY NOTE: We are expecting user.permissions passed from our Laravel app, passed in via our Inertia Shared data

import { user } from './composables/useSharedData'

// Return true if user has the specified permission - ie: "use-app"
export function laravelUserCan(permissionToCheck) {
    if (!checkUserPermissionsExist())   return false;
    return user.value.permissions.some(p => p.permission===permissionToCheck);
}

// Return any restrictions associated with the specified permission
export function laravelUserRestrictions(permissionToCheck) {
    if (!checkUserPermissionsExist())   return false;
    const perm = user.value.permissions.find(p => p.permission===permissionToCheck);
    if (perm === undefined)   return { status:"NOT PERMITTED" }
    if (!perm.restrictions )  return { status:"ALL PERMITTED" }
    try { return  { status:"SOME PERMITTED", ...perm.restrictions } }
    catch { return { status:"NOT PERMITTED", error:"ERROR DECODING RESTRICTIONS" } }   // note: now that JSON encoding is being handled by array-casting in the Model back-end, this error checking is less important.  (JSON errors now get converted by backend to NULLs without complaint)
}

// Check existence of user permissions
export function checkUserPermissionsExist() {
    if (!user.value?.permissions) {
        console.error("User permissions not found. Check that user.permissions is being passed correctly from useSharedData.");
        return false;
    }
    return true;
}
