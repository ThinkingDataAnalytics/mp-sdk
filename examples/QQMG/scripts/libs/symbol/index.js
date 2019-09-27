let Symbol  = window.Symbol;
let _counter = 0;

if (!Symbol) {
    Symbol = function Symbol(description) {
        if (this instanceof Symbol) {
            throw new TypeError('Symbol is not a constructor');
        }
        let symbolKey = description || '';
        symbolKey = String(symbolKey);

        return `@@${symbolKey}_${Math.floor(Math.random() * 1000000000)}_${++_counter}`;
    };

    Symbol.iterator = Symbol('Symbol.iterator');
}

window.Symbol = Symbol;
