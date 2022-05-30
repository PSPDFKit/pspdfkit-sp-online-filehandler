let indentLevel = 0;

export function log(message: string) {

    // could do more later
    console.log(`${(new Array(indentLevel * 2)).fill(" ").join("")}${message}`);
}

export function enter(name: string) {
    console.log(`\n${(new Array(indentLevel * 2)).fill(" ").join("")}Entering: ${name}`);
    indentLevel++;
}

export function leave(name: string) {
    indentLevel--;
    console.log(`${(new Array(indentLevel * 2)).fill(" ").join("")}Leaving: ${name}\n`);
}

export function reset() {
    console.clear();
}
