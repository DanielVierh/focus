"use strict";
console.log('Hello World');
let age = 20;
if (age < 50) {
    age += 10;
    console.log(age);
}
let user = [1, 'Mosh'];
var Size;
(function (Size) {
    Size[Size["Small"] = 0] = "Small";
    Size[Size["Medium"] = 1] = "Medium";
    Size[Size["Large"] = 2] = "Large";
})(Size || (Size = {}));
let employee = {
    id: 1,
    name: 'Max',
    retire: (date) => {
        console.log(date);
    }
};
function kgToLbs(weight) {
    if (typeof weight === 'number') {
        return weight * 2.2;
    }
    else {
        return parseInt(weight) * 2.2;
    }
}
//# sourceMappingURL=index.js.map