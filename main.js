const Chitter = {
      asm: {
            arithmetics: new Set([
                "ADD", "SUB", "INC", "DEC", "MUL", "IMUL", "DIV", "IDIV", "AND", "OR", "XOR", "NOT", "SHL", "SHR",
            ]),
            criticals: new Set([
                  "RET", "PROC", "ENDP", "END"
            ]),
            instructions: new Set([
                  "MOV", "MOVS", "MOVSX", "MOVZX", "CMP",
                  "PUSH", "POP",
                  "LEA", "NOP", "HLT", "INT", "LEAVE", "CLC", "STC", "CLD", "STD", "CLI", "STI",
                  "CMPXCHG", "XCHG", "BSWAP", "NOP", "PUSHF", "POPF", "REP", "REPE", "REPZ",
                  "REPNE", "REPNZ", "CMC", "CWDE", "CDQ", "WAIT", "CBW", "CWD", "INTO", "IRET", "INCLUDE",
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
                  'DI', 'SI', 'EDI', 'ESI', 'RDI', 'RSI',
            ]),
      }
}

const hightlight_btn = document.getElementById("btn-highlight");
hightlight_btn.addEventListener("click", () => {
    code = document.getElementById("input-text").value.split("\n");
    const print = console.log;
    // print(code);

    const DOM = [];

    for (const line of code) {
        const tokens = line.match(/[^ ,]+|,/g) ?? line;
        const line_ = [];

        for (let i = 0; i < tokens.length; i++) {
            let token = tokens[i];
            let klass = "plain";
            let already_been_added = false;

            if (!isNaN(token)) {
                klass = "constant";
            } else if (token.endsWith(":")) {
                klass = "function-label";
            } else if (tokens[i + 1] === ",") {
                already_been_added = true;
                line_.push(
                    `<span class="registers">${token}<span class="plain">,</span></span>`
                );
                i++;
            } else {
                for (const key of Object.keys(Chitter.asm)) {
                    if (Chitter.asm[key].has(token.toUpperCase())) {
                        klass = key;

                        if (key === "jumps") {
                            already_been_added = true;
                            line_.unshift(
                                `<span class="${klass}">${token}</span>`
                            );

                            const t = tokens[++i];
                            line_.push(
                                `<span class="function-label">${t}</span>`
                            );
                        }
                        break;
                    }
                }
            }
            if (!already_been_added)
                line_.push(`<span class="${klass}">${token}</span>`);
        }

        const newbie = document.createElement("code");
        newbie.innerHTML = line_.join(" ") + "<br>";

        DOM.push(newbie);
    }
    const output = document.getElementById("output-text");
    output.innerHTML = "";
    // print(DOM);
    DOM.forEach((e) => output.appendChild(e));
});
