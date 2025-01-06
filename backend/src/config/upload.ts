import path from "path";
import multer from "multer";
import { format } from "date-fns";

// Define o caminho para a pasta pública onde os arquivos serão armazenados
// Usa path.resolve para garantir o caminho absoluto correto
const publicFolder = path.resolve(__dirname, "..", "..", "public");

// Configurações de upload de arquivos
// Define como e onde os arquivos enviados serão armazenados
export default {
  // Diretório base para armazenamento dos arquivos
  directory: publicFolder,

  // Configuração do multer para armazenamento em disco
  // Gerencia o destino e nome dos arquivos uploadados
  storage: multer.diskStorage({
    // Define o destino dos arquivos como a pasta pública
    destination: publicFolder,

    // Função que define o nome do arquivo no sistema
    // Personaliza o nome para evitar conflitos e manter organização
    filename(req, file, cb) {
      let fileName;
      if (file.mimetype?.toLocaleLowerCase().endsWith("xml")) {
        fileName = file.originalname;
      } else {
        const { originalname } = file;
        const ext = path.extname(originalname);
        const name = originalname.replace(ext, "");
        const date = format(new Date(), "ddMMyyyyHHmmssSSS");
        fileName = `${name}_${date}${ext}`;
      }

      return cb(null, fileName);
    }
  })
};
