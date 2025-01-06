import Message from "../../models/Message";
import Contact from "../../models/Contact";
import Tags from "../../models/Tag";
import ContactTag from "../../models/ContactTag";

interface HandleMessageReceivedData {
  message: Message;
  contact: Contact;
  tenantId: number;
}

class HandleMessageReceivedService {
  public async execute({ message, contact, tenantId }: HandleMessageReceivedData): Promise<void> {
    try {
      console.log("\n=== Iniciando HandleMessageReceivedService ===");
      console.log("Mensagem recebida:", message.body);
      console.log("Contact ID:", contact.id);
      console.log("Tenant ID:", tenantId);

      // Buscar todas as tags ativas
      const tags = await Tags.findAll({
        where: {
          tenantId,
          isActive: true
        }
      });

      // Filtrar tags que têm autoTag configurado e processar
      const tagsWithAutoTag = tags.filter(tag => tag.autoTag !== null && tag.autoTag !== '');
      console.log("\nTags com autoTag configurado:", tagsWithAutoTag.map(t => ({
        id: t.id,
        tag: t.tag,
        autoTag: t.autoTag
      })));
      
      for (const tag of tagsWithAutoTag) {
        console.log(`\nProcessando tag "${tag.tag}":`);
        
        // Função para normalizar texto
        const normalizeText = (text: string) => {
          return text
            ?.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // remove acentos
            .toLowerCase()
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '') // remove pontuação
            .replace(/\s+/g, ' ') // remove espaços extras
            .trim();
        };

        const messageText = normalizeText(message.body || '');
        const autoTagText = normalizeText(tag.autoTag || '');

        console.log("Texto original da mensagem:", message.body);
        console.log("AutoTag original:", tag.autoTag);
        console.log("Texto da mensagem normalizado:", messageText);
        console.log("AutoTag normalizado:", autoTagText);

        if (messageText && autoTagText) {
          // Primeiro tenta comparação exata
          let isMatch = messageText === autoTagText;
          
          // Se não houver match exato, tenta com includes
          if (!isMatch) {
            isMatch = messageText.includes(autoTagText);
          }

          console.log(`Tipo de comparação: ${isMatch ? (messageText === autoTagText ? 'MATCH EXATO' : 'MATCH PARCIAL') : 'Sem correspondência'}`);

          if (isMatch) {
            // Verificar se o contato já tem esta tag
            const existingTag = await ContactTag.findOne({
              where: {
                contactId: contact.id,
                tagId: tag.id
              }
            });

            if (!existingTag) {
              console.log(`Adicionando tag "${tag.tag}" ao contato ${contact.id}`);
              try {
                const newContactTag = await ContactTag.create({
                  contactId: contact.id,
                  tagId: tag.id,
                  tenantId
                });
                console.log("Tag adicionada com sucesso:", newContactTag.id);
              } catch (createError) {
                console.error("Erro ao criar ContactTag:", createError);
                throw createError;
              }
            } else {
              console.log(`Contato já possui a tag "${tag.tag}"`);
            }
          }
        }
      }
      console.log("\n=== Fim do processamento ===\n");
    } catch (error) {
      console.error("Erro ao processar auto-tag:", error);
      throw error;
    }
  }
}

export default HandleMessageReceivedService;
