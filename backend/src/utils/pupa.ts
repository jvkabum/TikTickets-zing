/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
/* eslint-disable prettier/prettier */

import { getHours } from "date-fns";

// Função interna que escapa caracteres HTML especiais
// Converte caracteres como &, ", ', <, > em suas entidades HTML
const _htmlEscape = string =>
  string
    .replace(/&/g, "&amp;") // Must happen first or else it will escape other just-escaped characters.
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

// Função interna que desfaz o escape de caracteres HTML
// Converte entidades HTML de volta para seus caracteres originais
const _htmlUnescape = (htmlString: string) =>
  htmlString
    .replace(/>/g, ">") // Desescapa o caractere '>'
    .replace(/</g, "<") // Desescapa o caractere '<'
    .replace(/&#0?39;/g, "'") // Desescapa o caractere "'"
    .replace(/"/g, '"') // Desescapa o caractere '"'
    .replace(/&amp;/g, "&"); // Desescapa o caractere '&'

// Função que escapa strings HTML, suportando template literals
// Permite escapar tanto strings simples quanto templates com valores dinâmicos
export function htmlEscape(strings: TemplateStringsArray, ...values: any[]) {
  if (typeof strings === "string") {
    return _htmlEscape(strings); // Escapa a string se for simples
  }

  let output = strings[0]; // Inicializa a saída com a primeira parte da string
  for (const [index, value] of values.entries()) {
    output = output + _htmlEscape(String(value)) + strings[index + 1]; // Escapa cada valor e concatena
  }

  return output; // Retorna a string escapada
}

// Função que desfaz o escape de strings HTML, suportando template literals
// Permite desescapar tanto strings simples quanto templates com valores dinâmicos
export function htmlUnescape(strings: TemplateStringsArray, ...values: any[]) {
  if (typeof strings === "string") {
    return _htmlUnescape(strings); // Desescapa a string se for simples
  }

  let output = strings[0]; // Inicializa a saída com a primeira parte da string
  for (const [index, value] of values.entries()) {
    output = output + _htmlUnescape(String(value)) + strings[index + 1]; // Desescapa cada valor e concatena
  }

  return output; // Retorna a string desescapada
}

// Classe de erro personalizada para valores ausentes em templates
// Usada quando um placeholder não pode ser substituído por falta de valor
export class MissingValueError extends Error {
  key: any; // Chave do placeholder que está faltando

  constructor(key: any) {
    super(
      `Missing a value for ${key ? `the placeholder: ${key}` : "a placeholder"}` // Mensagem de erro
    );
    this.name = "MissingValueError"; // Nome da classe de erro
    this.key = key; // Armazena a chave do placeholder
  }
}

// Função principal que processa templates com placeholders
// Substitui placeholders no formato {{chave}} ou {chave} por valores reais
export const pupa = function pupa(
  template: string,
  data: object,
  { ignoreMissing = true, transform = (value: any) => value } = {}
) {
  if (typeof template !== "string") {
    throw new TypeError(
      `Expected a \`string\` in the first argument, got \`${typeof template}\`` // Lança erro se o template não for uma string
    );
  }

  if (typeof data !== "object") {
    throw new TypeError(
      `Expected an \`object\` or \`Array\` in the second argument, got \`${typeof data}\`` // Lança erro se os dados não forem um objeto
    );
  }

  const hours = getHours(new Date()); // Obtém a hora atual
  const getGreeting = () => {
    if (hours >= 6 && hours <= 11) {
      return "Bom dia!"; // Retorna saudação de bom dia
    }
    if (hours > 11 && hours <= 17) {
      return "Boa Tarde!"; // Retorna saudação de boa tarde
    }
    if (hours > 17 && hours <= 23) {
      return "Boa Noite!"; // Retorna saudação de boa noite
    }
    return "Olá!"; // Retorna saudação padrão
  };

  data = { ...data, greeting: getGreeting() }; // Adiciona a saudação aos dados

  const replace = (placeholder: string, key: string) => {
    let value = data; // Inicializa o valor com os dados
    for (const property of key.split(".")) {
      value = value ? value[property] : undefined; // Navega pela chave
    }

    const transformedValue = transform(value); // Aplica transformação ao valor
    if (transformedValue === undefined) {
      if (ignoreMissing) {
        return ""; // Retorna string vazia se ignorar valores ausentes
      }

      throw new MissingValueError(key); // Lança erro se o valor estiver ausente
    }

    return String(transformedValue); // Retorna o valor transformado como string
  };

  const composeHtmlEscape =
    replacer =>
      (...args: any) =>
        htmlEscape(replacer(...args)); // Composição para escapar HTML

  // O regex tenta corresponder a um número dentro de `{{ }}` ou um identificador ou caminho de chave válido.
  const doubleBraceRegex = /{{(\d+|[a-z$_][\w\-$]*?(?:\.[\w\-$]*?)*?)}}/gi;

  if (doubleBraceRegex.test(template)) {
    template = template.replace(doubleBraceRegex, composeHtmlEscape(replace)); // Substitui placeholders duplos
  }

  const braceRegex = /{(\d+|[a-z$_][\w\-$]*?(?:\.[\w\-$]*?)*?)}/gi;

  return template.replace(braceRegex, replace); // Substitui placeholders simples
};
