console.log('Hello World')

let age: number = 20;
if (age < 50) {
    age += 10;
    console.log(age);
}

// Tuple
let user: [number, string] = [1, 'Mosh'];

// Enums
enum Size {Small, Medium, Large}

// Objects
type Employee = {
    readonly id: number, 
    name: string,
    retire: (date: Date) => void
}

let employee: Employee = {
    id: 1, 
    name: 'Max', 
    retire: (date: Date) => {
        console.log(date);
    }
}

// Union 
function kgToLbs(weight: number | string): number {
    if(typeof weight === 'number') {
        return weight * 2.2;
    }else {
       return parseInt(weight) * 2.2;
    }
}