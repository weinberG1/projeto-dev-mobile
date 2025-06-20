// Utilizado para resolver problemas com o Firebase / Expo SDK 53
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Firebase / Expo SDK 53: permitir arquivos ".cjs" e usar resolução clássica de "exports" do Node
// para que os sub-pacotes do Firebase sejam empacotados corretamente.
config.resolver.sourceExts = config.resolver.sourceExts || [];
if (!config.resolver.sourceExts.includes("cjs")) {
  config.resolver.sourceExts.push("cjs");
}

// Desabilitar o novo e mais estrito comportamento de resolução de "package.json exports"
// até que todas as dependências (Firebase, React-Native-WebView, etc.) 
// forneçam mapas de exportação completos.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;