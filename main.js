let Chitter = {};
fetch('./chitter.json')
    .then(response => response.json())
    .then(chitter => Chitter = chitter );

const is_space = (char) => char === ' ' || char === '\t';

const notation_ok = (token) => {
    token = token.toLowerCase();
    const rest = token.substring(0, token.length - 1);
    
    if (token.endsWith("h")) {
        token = `0x${rest}`;
    } else if (token.endsWith("b")) {
        token = `0b${rest}`;
    } else if (token.endsWith("d")) {
        token = rest;
    }
    return !isNaN(token);
};

const razor = (line) => {
    const array = [];
    let word = '';

    for (let i = 0; i < line.length; i++) {
        const char = line.charAt(i);

        if (char === ';') {
            if (word !== '') array.push(word);
            array.push(char);
            word = line.substring(i);
            break;
        }

        if (is_space(char) || Chitter.asm.operators.includes(char)) {
            if (word !== '') array.push(word);
            array.push(char);
            word = '';
            continue;
        }

        word += char;
    }

    if (word !== '') array.push(word);
    return array;
};

const chittify = () => {
    const code = input_text.value.split("\n");

    const DOM = [];
    let is_comment = false;
    let cmnt_char = "";

    for (const line of code) {
        const tokens = razor(line);

        const line_ = [];

        let spaces = "";
        for (let i = 0; i < tokens.length; i++) {
            let token = tokens[i];
            let klass = "plain";
            let already_been_added = false;
            const nikka_token = token.toLowerCase();

            if (is_space(token)) {
                spaces += token;
                continue;
            }

            if (is_comment && token === cmnt_char) {
                line_.push(`${spaces}<span class="comment">${token}</span>`);

                is_comment = false;
                cmnt_char = "";
                continue;
            }

            if (is_comment) {
                line_.push(`${spaces}<span class="comment">${token}</span>`);
                spaces = "";

                continue;
            }
            if (token === ";" || nikka_token === "comment") {
                if (token === ";") {
                    token = tokens[++i] ?? "";
                    klass = "comment";
                } else {
                    line_.push(
                        `${spaces}<span class="instructions">${token}</span>`
                    );
                    spaces = "";
                    is_comment = true;
                    while (is_space(tokens[++i]))
                        spaces += tokens[i];

                    cmnt_char = tokens[i] ?? "";
                    line_.push(
                        `${spaces}<span class="comment">${cmnt_char}</span>`
                    );
                    continue;
                }
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
                const after = tokens[++i] ?? "";
                if (after.endsWith(":")) {
                    klass = "jumps";
                } else {
                    klass =
                        token === "%" && notation_ok(after)
                            ? "constant"
                            : "criticals";
                }
                line_.push(
                    `${spaces}<span class="${klass}">${token}${after}</span>`
                );
                spaces = "";
                already_been_added = true;
            } else if (nikka_token === "include") {
                line_.push(`${spaces}<span class="criticals">${token}</span>`);

                spaces = "";
                klass = "constant";

                token = "";
                while (i < tokens.length) {
                    token += tokens[++i] ?? "";
                }
            } else {
                for (const key of Object.keys(Chitter.asm)) {
                    if (Chitter.asm[key].includes(token.toUpperCase())) {
                        klass = key;

                        if (key === "jumps") {
                            already_been_added = true;
                            line_.unshift(
                                `${spaces}<span class="${klass}">${token}</span>`
                            );

                            spaces = "";

                            let t = tokens[++i] ?? "";
                            if (t) {
                                while (is_space(tokens[i])) {
                                    spaces += tokens[i++];
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
        newbie.innerHTML = line_.join("") + "<br/>";

        DOM.push(newbie);
    }
    const output = document.getElementById("output-text");
    output.innerHTML = "";
    const pre = document.createElement("pre");

    // let i = 1;
    // const largest_line_number = (DOM.length + 1).toString().length;
    DOM.forEach((e) => {
        // const old = e.innerHTML;
        // e.innerHTML =
        //     `<span class="line-number" contenteditable="false">${(i++)
        //         .toString()
        //         .padStart(largest_line_number)}.</span>` + old;

        pre.appendChild(e);
    });

    output.appendChild(pre);
};

const handle_tab = (btn) => {
    if (btn.key === "Tab") {
        btn.preventDefault();

        const start = input_text.selectionStart;
        const end = input_text.selectionEnd;

        const tab_size = +document.getElementById("tab-size").value;
        const n_spaces = tab_size ? tab_size : 5;

        input_text.style.tabSize = n_spaces;
        output_text.style.tabSize = n_spaces;
        const tab = "\t";
        input_text.value =
            input_text.value.substring(0, start) +
            tab +
            input_text.value.substring(end);

        input_text.setSelectionRange(start + 1, end + 1); // adding 1 bcz length of `tab`
    }
};

const hightlight_btn = document.getElementById("btn-highlight");
const input_text = document.getElementById("input-text");
const output_text = document.getElementById("output-text");

hightlight_btn.addEventListener("click", chittify);
input_text.addEventListener("keydown", handle_tab);
output_text.addEventListener("keydown", (btn) => {
    if (btn.key === "Tab") {
        btn.preventDefault();
    }
});

// document.getElementById("input-text").addEventListener("input", chittify); // React but O(n)
