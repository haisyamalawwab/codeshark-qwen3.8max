/* Highlighter ringan berbasis regex sticky — cukup untuk snippet edukasi. */

type Rule = [string, RegExp];
type Tok = { t: string; c?: string };

const htmlOuter: Rule[] = [["tk-tag", /<!--[\s\S]*?-->|<\/?[a-zA-Z][^>]*?\/?>/y]];

const htmlInner: Rule[] = [
  ["tk-com", /<!--[\s\S]*?-->/y],
  ["tk-tname", /<\/?[a-zA-Z][\w-]*/y],
  ["tk-str", /"[^"]*"/y],
  ["tk-attr", /[a-zA-Z-]+(?==)/y],
  ["tk-pun", /[<>/=!]+/y],
];

const cssRules: Rule[] = [
  ["tk-com", /\/\*[\s\S]*?\*\//y],
  ["tk-str", /"[^"]*"|'[^']*'/y],
  ["tk-hex", /#[0-9a-fA-F]{3,8}\b/y],
  ["tk-num", /-?\d+(?:\.\d+)?(?:px|%|em|rem|s|ms|vh|vw|ch)?/y],
  ["tk-sel", /[.#][a-zA-Z_-][\w-]*/y],
  ["tk-prop", /[a-zA-Z-]+(?=\s*:)/y],
  ["tk-pun", /[{}();:,>~+*]/y],
  ["tk-word", /[a-zA-Z-]+/y],
];

const jsRules: Rule[] = [
  ["tk-com", /\/\/[^\n]*|\/\*[\s\S]*?\*\//y],
  ["tk-str", /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/y],
  [
    "tk-kw",
    /\b(?:let|const|var|function|return|if|else|for|while|do|new|typeof|true|false|null|undefined|this)\b/y,
  ],
  ["tk-bi", /\b(?:document|console|window|Math|JSON)\b/y],
  ["tk-num", /\b\d+(?:\.\d+)?\b/y],
  ["tk-fn", /[a-zA-Z_$][\w$]*(?=\s*\()/y],
  ["tk-id", /[a-zA-Z_$][\w$]*/y],
  ["tk-pun", /[{}()[\].,;:=+\-*/<>!&|%?]+/y],
];

function walk(code: string, rules: Rule[]): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  let plain = "";
  const flush = () => {
    if (plain) {
      out.push({ t: plain });
      plain = "";
    }
  };
  while (i < code.length) {
    let matched = false;
    for (const [cls, re] of rules) {
      re.lastIndex = i;
      const m = re.exec(code);
      if (m && m.index === i && m[0].length > 0) {
        flush();
        out.push({ t: m[0], c: cls });
        i += m[0].length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      plain += code[i];
      i++;
    }
  }
  flush();
  return out;
}

export function tokenize(code: string, lang: "html" | "css" | "js"): Tok[] {
  let tokens = walk(code, lang === "html" ? htmlOuter : lang === "css" ? cssRules : jsRules);
  if (lang === "html") {
    tokens = tokens.flatMap((t) =>
      t.c === "tk-tag" && !t.t.startsWith("<!--") ? walk(t.t, htmlInner) : [t]
    );
  }
  return tokens;
}

export function Highlight({ code, lang }: { code: string; lang: "html" | "css" | "js" }) {
  const tokens = tokenize(code, lang);
  return (
    <pre className="font-code whitespace-pre-wrap break-words text-[13.5px] leading-[1.8]">
      {tokens.map((t, i) =>
        t.c ? (
          <span key={i} className={t.c}>
            {t.t}
          </span>
        ) : (
          <span key={i}>{t.t}</span>
        )
      )}
    </pre>
  );
}
