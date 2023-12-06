const code = `
include irvine32.inc

.data
  first   dd  1011
  second  dd  80
  third   dd  25

  ye_akhri_hai        db  0
  the_gorgeous_number dd  0

  pretty_msg          byte    "The pretty number is >>> ", 0

.code
main proc
  mov eax, first
  mov ebx, second

  cmp eax, ebx
  jg move_first_operand
  jmp move_second_operand

check_:
  cmp ye_akhri_hai, 1
  je ouwt
  
  mov ye_akhri_hai, 1

  mov eax, the_gorgeous_number
  mov ebx, third
  cmp eax, ebx
  jg  move_first_operand
  jmp move_second_operand

move_first_operand:
  mov the_gorgeous_number, eax
  jmp check_
  
move_second_operand:
  mov the_gorgeous_number, ebx
  jmp check_


ouwt:
  mov edx, offset pretty_msg
  call WriteString

  mov eax, the_gorgeous_number
  call WriteDec

  call CRLF   
  call ReadChar
  
  invoke ExitProcess, 0
main endp
end main
`.split('\n');


const print = console.log;
const DOM = []

const Chitter = {
  asm: {
    arithmetics: new Set([
      "ADD", "SUB", "INC", "DEC", "MUL", "IMUL", "DIV", "IDIV", "AND", "OR", "XOR", "NOT",
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


for (const line of code) {
  const tokens = line.split(' ');
  const line_ = [];

  print(tokens);
  let spaces = 0;
  while (tokens[++spaces] === '');

  for (let i = 0; i < tokens.length; i++) {
    let token = tokens[i];
    let klass = 'plain';
    let is_jump = false;

    let space_not_added = true;
    // let count = 0;

    if (token.length === 0 && space_not_added) {
      line_.push('');
      space_not_added = false;
      continue;
    }

    // in_middle = true;

    let comma = '';
    if (token.includes(',')) {
      token = token.substring(0, token.indexOf(','));
      comma = ',';
    }

    if (!isNaN(token)) {
      klass = 'constant'
    } else if (token.endsWith(':')) {
      klass = 'function-label';
    } else {
      for (const key of Object.keys(Chitter.asm)) {
        if (Chitter.asm[key].has(token.toUpperCase())) {
          klass = key;

          if (key === 'jumps') {
            is_jump = true;
            print(key)

            // print(tokens)
            while (tokens[++i] === '');

            const t = tokens[i];
            // print(t)
            line_.push(`<span class="function-label">${t}</span>`);
          }
          break;
        }
      }
    }

    let empty = '';
    while (--spaces >= 0) empty += ' ';

    if (is_jump) {
      line_.unshift(`${empty}<span class="${klass}">${token}</span>`);
    } else {
      line_.push(`<span class="${klass}">${token}</span>`);
    }

    if (comma.length !== 0) {
      line_.push(`<span class="plain">,</span>`);
    }
  }

  const newbie = document.createElement('code');
  newbie.innerHTML = line_.join(' ') + '<br>';

  DOM.push(newbie);
}

const pre = document.createElement('pre')
const body = document.querySelector('body');
body.appendChild(pre);
DOM.forEach(e => pre.appendChild(e));
