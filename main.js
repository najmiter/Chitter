const Chitter = {
      asm: {
            operators: new Set(["+", "-", "/", "*", "[", "]"]),
            arithmetics: new Set([
                "ADD", "SUB", "INC", "DEC", "MUL", "IMUL", "DIV", "IDIV", "AND", "OR", "XOR", "NOT", "SHL", "SHR",
            ]),
            criticals: new Set([
                  "RET", "PROC", "ENDP", "END", "INCLUDE",
            ]),
            instructions: new Set([
                  "MOV", "MOVS", "MOVSX", "MOVZX", "CMP",
                  "PUSH", "POP", "PUSHAD", "POPAD",
                  "LEA", "NOP", "HLT", "INT", "LEAVE", "CLC", "STC", "CLD", "STD", "CLI", "STI",
                  "CMPXCHG", "XCHG", "BSWAP", "NOP", "PUSHF", "POPF", "REP", "REPE", "REPZ",
                  "REPNE", "REPNZ", "CMC", "CWDE", "CDQ", "WAIT", "CBW", "CWD", "INTO", "IRET",
                  "OFFSET",
            ]),
            datatypes: new Set([
                  "BYTE", "WORD", "DWORD", "QWORD", "DB", "DW", "DD", "DQ", "REAL"
            ]),
            jumps: new Set([
                  "JMP", "JE", "JNE", "JG", "JGE", "JL", "JLE", "JZ", "JNZ", "JS", "JNS", "JC", "JNC", "JB", "JA", "CALL", "INVOKE",
            ]),
            registers: new Set([
                  "AL", "BL", "CL", "DL", "AH", "BH", "CH", "DH", 'AX', 'BX', 'CX',
                  'DX', 'EAX', 'EBX', 'ECX', 'EDX', 'RAX', 'RBX', 'RCX', 'RDX',
                  'DI', 'SI', 'EDI', 'ESI', 'EBP', 'ESP', 'RBP', 'RSP', 'RDI', 'RSI',
            ]),
      }
}

const razor = (string) => {
    let array = [];
    let word = "";

    for (let i = 0; i < string.length; i++) {
        const char = string.charAt(i);
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

const hightlight_btn = document.getElementById("btn-highlight");
hightlight_btn.addEventListener("click", () => {
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

            if (!isNaN(token)) {
                klass = "constant";
            } else if (token.endsWith(":")) {
                klass = "function-label";
            } else if (token.endsWith(",")) {
                already_been_added = true;
                token.replace(",", "");
                line_.push(
                    `<span class="registers">${token.replace(
                        ",",
                        ""
                    )}<span class="plain">,</span></span>`
                );
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

                            const t = tokens[++i];
                            if (t)
                                line_.push(
                                    `<span class="function-label">${t}</span>`
                                );
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
        newbie.innerHTML = line_.join(" ") + "<br>";

        DOM.push(newbie);
    }
    const output = document.getElementById("output-text");
    output.innerHTML = "";
    const pre = document.createElement("pre");
    DOM.forEach((e) => pre.appendChild(e));

    output.appendChild(pre);
});
