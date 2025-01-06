// Classe de erro para valores ausentes
export class MissingValueError extends Error {
  name: "MissingValueError"; // Nome do erro

  message: string; // Mensagem do erro

  key: string; // Chave associada ao erro

  constructor(key: string); // Construtor que recebe a chave
}

// Tipo de opções para a função pupa
export type Options = {
  /**
  Por padrão, Pupa lança um `MissingValueError` quando um placeholder resolve para `undefined`. Com esta opção definida como `true`, ele simplesmente ignora e deixa o placeholder como está.

  @default false
  */
  ignoreMissing?: boolean; // Ignora valores ausentes se definido como true
  /**
  Realiza uma operação arbitrária para cada interpolação. Se o valor retornado for `undefined`, ele se comporta de maneira diferente dependendo da opção `ignoreMissing`. Caso contrário, o valor retornado será interpolado em uma string (e escapado quando entre chaves duplas) e incorporado ao template.

  @default ({value}) => value
  */
  transform?: (data: { value: unknown; key: string }) => unknown; // Função de transformação para interpolação
};

/**
Template micro simples.

@param template - Texto com placeholders para propriedades de `data`.
@param data - Dados a serem interpolados no `template`.

@example
```
import pupa from 'pupa';

pupa('The mobile number of {name} is {phone.mobile}', {
  name: 'Sindre',
  phone: {
    mobile: '609 24 363'
  }
});
//=> 'The mobile number of Sindre is 609 24 363'

pupa('I like {0} and {1}', ['🦄', '🐮']);
//=> 'I like 🦄 and 🐮'

// Double braces encodes the HTML entities to avoid code injection.
pupa('I like {{0}} and {{1}}', ['<br>🦄</br>', '<i>🐮</i>']);
//=> 'I like &lt;br&gt;🦄&lt;/br&gt; and &lt;i&gt;🐮&lt;/i&gt;'
```
*/
export default function pupa(
  template: string, // Template com placeholders
  data: unknown[] | Record<string, any>, // Dados para interpolação
  options?: Options // Opções adicionais
): string; // Retorna a string interpolada
