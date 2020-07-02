// Object map helper functions - inspired by: https://stackoverflow.com/questions/14810506/map-function-for-objects-instead-of-arrays
// Map objects (or arrays) to objects... just like ES6 lets you do with arrays

/*
    Examples:

    arr = [ { x:1, y:"hi" }, { x:3, y:"there" }, { x:5, y:"world" }, ]
    obj1 = { x:1, y:2, z:3 }
    obj2 = { a:{ x:1, y:"hi" }, b:{ x:3, y:"there" }, c:{ x:5, y:"world" }, }

    arr.map(v => v.x)                                                         -->  [ 1, 3, 5 ]
    arr.map(v => ({ x: v.x }) )                                               -->  [ { x:1 }, { x:3 }, { x:5 }, ]

    objectMapfromObject(obj1,  (k,v) => v*2  )                                --> { x:2, y:4, z:6 }
    objectMapfromObject(obj1,  (k,v) => ({ orig:v, double:v*2 })  )           --> { x:{orig:1,double:2}, y:{orig:2,double:4}, {orig:3,double:6} }

    objectMapfromArrayPairs(arr,  v => [v.y, v.x] )                           --> { hi: 1, there: 3, world: 5 }

    objectMapfromObjectPairs(obj2,  (k,v) => [v.y, { x:v.x, origkey:k}] )     --> { hi:{x:1,origkey:"a" }, there:{x:3,origkey:"b"}, world:{x:5,origkey:"c" }

*/


// Return an object with the same property-names (ie: keys) as 'obj', where the property values are defined by the mapping function.
export const objectMapfromObject = (obj, fn) =>
	Object.fromEntries(
		Object.entries(obj).map(
			([key, value], index) => [key, fn(key, value, index)]
		)
    )

// Return an object where the property values are defined by the [key, value] pairs returned by the mapping function.  (Mapping function accepts an Object)
export const objectMapfromObjectPairs = (obj, fn) =>
	Object.fromEntries(
		Object.entries(obj).map(
			([key, value], index) => fn(key, value, index)
		)
    )

// Return an object where the property values are defined by the [key, value] pairs returned by the mapping function.  (Mapping function accepts an Array)
export const objectMapfromArrayPairs = (arr, fn) =>
Object.fromEntries(
    arr.map(
        (value, index) => fn(value, index)
    )
)
