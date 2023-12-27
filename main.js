const Chitter = {
      asm: {
            operators: new Set(["+", "-", "/", "*", '(', ')', "[", "]", '"', "'", ',', '.', '%', '=', '==', '<', '>', '!', '!=', '<=', '>=', '+=', '-=', '*=', '/=', '&', '&&', '|', '||', '^', '~', ]),
            arithmetics: new Set([
                "ADD", "SUB", "INC", "DEC", "MUL", "IMUL", "DIV", "IDIV", "AND", "OR", "XOR", "NOT", "SHL", "SHR",
            ]),
            criticals: new Set([
                  "RET", "PROC", "ENDP", "END", "INCLUDE", "SECTION", 
            ]),
            instructions: new Set([
                  "MOV", "MOVS", "MOVSX", "MOVZX", "CMP",
                  "PUSH", "POP", "PUSHAD", "POPAD",
                  "LEA", "NOP", "HLT", "INT", "LEAVE", "CLC", "STC", "CLD", "STD", "CLI", "STI",
                  "CMPXCHG", "XCHG", "BSWAP", "NOP", "PUSHF", "POPF", "REP", "REPE", "REPZ",
                  "REPNE", "REPNZ", "CMC", "CWDE", "CDQ", "WAIT", "CBW", "CWD", "INTO", "IRET",
                  "OFFSET", "PTR", "FLD", "FSTP", "SYSCALL", "USES", "COMMENT", "EQU", "GLOBAL",
            ]),
            datatypes: new Set([
                  "BYTE", "WORD", "DWORD", "QWORD", "DB", "DW", "DD", "DQ", "REAL", "RESB", "RESW", "RESD", "RESQ", 
            ]),
            jumps: new Set([
                  "JMP", "JE", "JNE", "JG", "JGE", "JL", "JLE", "JZ", "JNZ", "JS", "JNS", "JC", "JNC", "JB", "JA", "CALL", "INVOKE",
            ]),
            registers: new Set([
                  "AL", "BL", "CL", "DL", "AH", "BH", "CH", "DH", 'AX', 'BX', 'CX',
                  'DX', 'EAX', 'EBX', 'ECX', 'EDX', 'RAX', 'RBX', 'RCX', 'RDX',
                  'DI', 'SI', 'EDI', 'ESI', 'EBP', 'ESP', 'RBP', 'RSP', 'RDI', 'RSI',
                  "R8", "R9", "R10", "R11", "R12", "R13", "R14", "R15", 
                  "R8B", "R8W", "R8D", "R9B", "R9W", "R9D", "R10B", "R10W", "R10D", "R11B", "R11W", "R11D", 
                  "R12B", "R12W", "R12D", "R13B", "R13W", "R13D", "R14B", "R14W", "R14D", "R15B", "R15W", "R15D",
 
            ]),
      }
}

const notation_ok = (token) => {
    token = token.toLowerCase();
    return (
        (!isNaN(token.charAt(token.length - 1)) && !isNaN(token)) || // because then all of it should be digits
        token.endsWith("d") ||
        token.endsWith("b") ||
        token.endsWith("h")
    );
};

const razor = (string) => {
    let array = [];
    let word = "";

    for (let i = 0; i < string.length; i++) {
        const char = string.charAt(i);
        if (char === ";") {
            if (word !== "") array.push(word);
            array.push(char);
            word = string.substring(i);
            break;
        }
        if (char === " " || char === "\t" || Chitter.asm.operators.has(char)) {
            if (word !== "") array.push(word);
            array.push(char);
            word = "";
            continue;
        }
        word += char;
    }

    if (word !== "") array.push(word);
    return array;
};

const chittify = () => {
    code = document.getElementById("input-text").value.split("\n");

    const DOM = [];

    for (const line of code) {
        const tokens = razor(line);

        const line_ = [];

        let spaces = "";
        for (let i = 0; i < tokens.length; i++) {
            let token = tokens[i];
            let klass = "plain";
            let already_been_added = false;

            if (token === " " || token === "\t") {
                spaces += token;
                continue;
            }

            if (token === ";") {
                token = tokens[++i] ?? "";
                klass = "comment";
            } else if (!isNaN(token[0]) && notation_ok(token)) {
                klass = "constant";
            } else if (token.endsWith(":")) {
                klass = "function-label";
            } else if (token.endsWith(",")) {
                already_been_added = true;
                line_.push(
                    `<span class="registers">${token.replace(
                        ",",
                        ""
                    )}<span class="plain">,</span></span>`
                );
            } else if (token === '"' || token === "'") {
                const quote = token;
                klass = "constant";
                while (
                    i < tokens.length &&
                    tokens[++i] !== quote &&
                    tokens[i + 1] !== ";"
                ) {
                    token += tokens[i] ?? "";
                }

                token += tokens[i] ?? "";
            } else if (token === "." || token === "%") {
                line_.push(
                    `${spaces}<span class="criticals">${token}${
                        tokens[++i] ?? ""
                    }</span>`
                );
                spaces = "";
                already_been_added = true;
            } else if (token.toLowerCase() === "include") {
                line_.push(`${spaces}<span class="criticals">${token}</span>`);

                spaces = "";
                klass = "constant";

                token = "";
                while (i < tokens.length) {
                    token += tokens[++i] ?? "";
                }
            } else {
                for (const key of Object.keys(Chitter.asm)) {
                    if (Chitter.asm[key].has(token.toUpperCase())) {
                        klass = key;

                        if (key === "jumps") {
                            already_been_added = true;
                            line_.unshift(
                                `${spaces}<span class="${klass}">${token}</span>`
                            );

                            spaces = "";

                            let t = tokens[++i] ?? "";
                            if (t) {
                                while (tokens[i] === " ") {
                                    spaces += " ";
                                    i += 1;
                                }

                                t = (tokens[i] ?? "") + (tokens[++i] ?? "");
                                if (t && t !== ";") {
                                    line_.push(
                                        `${spaces}<span class="function-label">${t}</span>`
                                    );
                                    spaces = "";
                                } else i -= 1;
                            }
                        }
                        break; // no need to check further (if anything's left)
                    }
                }
            }
            if (!already_been_added) {
                line_.push(`${spaces}<span class="${klass}">${token}</span>`);
                spaces = "";
            }
        }

        const newbie = document.createElement("code");
        newbie.innerHTML = line_.join("") + "<br>";

        DOM.push(newbie);
    }
    const output = document.getElementById("output-text");
    output.innerHTML = "";
    const pre = document.createElement("pre");
    DOM.forEach((e) => pre.appendChild(e));

    output.appendChild(pre);
    window.location.href += "#output-text"; // for mobile users (probably some other way but for now, it is what it is)
};

const hightlight_btn = document.getElementById("btn-highlight");
const input_text = document.getElementById("input-text");

hightlight_btn.addEventListener("click", chittify);
input_text.addEventListener("keydown", (btn) => {
    if (btn.key === "Tab") {
        btn.preventDefault();
        input_text.value += "     "; // 5 spaces. (might convert it into a variable that the user may set as they wish later)
        // also, this is not what we want. bcz it only adds spaces at the end :P
    }
});
// document.getElementById("input-text").addEventListener("input", chittify); // React but O(n)
