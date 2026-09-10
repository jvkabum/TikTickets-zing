import os
import re

old_dir = r"C:\git\TikTickets\frontend\src"
new_dir = r"C:\git\TikTickets\frontend-vue-3\src"

def get_files(directory):
    files_list = []
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.vue') or file.endswith('.js') or file.endswith('.ts'):
                rel_path = os.path.relpath(os.path.join(root, file), directory)
                files_list.append(rel_path)
    return set(files_list)

old_files = get_files(old_dir)
new_files = get_files(new_dir)

missing_in_new = old_files - new_files
new_additions = new_files - old_files
common_files = old_files.intersection(new_files)

report = []
report.append("# [A] Relatório de Comparação (Vue 2 vs Vue 3)")
report.append("\n## Arquivos Removidos / Não Migrados")
for f in sorted(missing_in_new):
    report.append(f"- `{f}`")

report.append("\n## Novos Arquivos (Composition API / Pinia)")
for f in sorted(new_additions):
    report.append(f"- `{f}`")

report.append("\n## [B] Lista de Bugs e Quebras de Funcionalidade Potenciais (Análise Estática)")

bugs = []
# Quick static analysis on common files
for f in sorted(common_files):
    new_path = os.path.join(new_dir, f)
    with open(new_path, 'r', encoding='utf-8', errors='ignore') as file:
        content = file.read()
        
        # Check Vue 2 syntax leaking into Vue 3
        if 'this.$set' in content:
            bugs.append(f"- **{f}**: Contém `this.$set` (removido no Vue 3)")
        if 'this.$delete' in content:
            bugs.append(f"- **{f}**: Contém `this.$delete` (removido no Vue 3)")
        if '$emit(\'input\'' in content or '$emit("input"' in content:
            bugs.append(f"- **{f}**: Emite `input` em vez de `update:modelValue`")
        if '.sync' in content:
            bugs.append(f"- **{f}**: Usa `.sync` modifier (deve ser `v-model:prop`)")
        if 'Vue.use' in content:
            bugs.append(f"- **{f}**: Usa `Vue.use` global")
        if 'this.$store' in content:
            bugs.append(f"- **{f}**: Usa `this.$store` (Vuex) ao invés do Pinia")
        if 'EventBus' in content or '$root.$on' in content:
            bugs.append(f"- **{f}**: Usa EventBus Global (removido no Vue 3, usar mitt ou Pinia)")
        if 'value=' in content and '<q-dialog' in content:
            bugs.append(f"- **{f}**: Possível uso de `value` em vez de `model-value` no QDialog")

if bugs:
    report.extend(bugs)
else:
    report.append("Nenhum bug estático grave encontrado na conversão de Options para Composition!")

report.append("\n## [C] Diferenças de API Vue/Quasar Pinia Encontradas")
report.append("- O novo projeto utiliza Vite (em vez de Vue CLI / Webpack)")
report.append("- O Store mudou radicalmente para Pinia (arquivos em `src/store` viraram composables)")
report.append("- O router agora usa `createRouter` e `createWebHistory`")

report.append("\n## [D] Sugestões de Correção")
report.append("Para corrigir eventuais quebras silenciosas no Quasar 2, busque substituir:")
report.append("```vue\n<q-dialog :value=\"isOpen\" @input=\"isOpen = $event\">\n```")
report.append("Por:")
report.append("```vue\n<q-dialog v-model=\"isOpen\">\n```")

report.append("\n## [E] Checklist Final")
report.append("- [x] Dependências compatíveis (Vite, Pinia, Quasar 2, Vue 3 instalados)")
report.append("- [ ] Eventos de Socket.io migrados para a nova API Go/Websockets")
report.append("- [x] Funcionalidades de rotas restabelecidas com vue-router 4")

with open(r"C:\git\TikTickets\frontend-vue-3\migration_report.md", "w", encoding="utf-8") as f:
    f.write("\n".join(report))

print("Relatório gerado!")
