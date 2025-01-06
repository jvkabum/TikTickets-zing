/* eslint-disable import/prefer-default-export */
// Interface que define os parâmetros para o atraso aleatório
// Permite especificar os limites mínimo e máximo do intervalo
interface IParams {
  minMilliseconds?: number;
  maxMilliseconds?: number;
}

// Função que cria um atraso aleatório na execução
// Útil para simular delays de rede ou evitar sobrecarga em requisições
export function sleepRandomTime({
  minMilliseconds,
  maxMilliseconds
}: IParams): Promise<void> {
  const min = !minMilliseconds ? 2 : minMilliseconds;
  const max = !maxMilliseconds ? 4 : maxMilliseconds;
  const ms = Math.random() * (max - min) + min;
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}
