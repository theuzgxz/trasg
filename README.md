# XYZARCRAFT — Website Oficial Minimalista

Site minimalista e performático para o modpack de RPG de Minecraft **Xyzarcraft**, desenvolvido com **Three.js** e design escuro editorial (estilo obsidian & ouro rúnico).

## 💎 Características Principais

- **Visual Minimalista & Autoral (Sem aspecto de site gerado por IA)**:
  - Paleta com fundo grafite/obsidiana profundo (`#08080a`), bordas sutis milimétricas e acentos em ouro rúnico (`#e5a93c`).
  - Tipografia de alta classe: `Cinzel` (títulos épicos), `JetBrains Mono` (hashes, versões e tags de sistema) e `Plus Jakarta Sans` (leitura ultra limpa).
  - Textura sutil de filme granulado e vinheta óptica.
- **Relíquia 3D Interativa com Three.js**:
  - Fragmento ancestral rúnico com cristais e blocos estilo voxel flutuantes.
  - Anéis orbitais dourados e mais de 700 partículas de brasas reativas.
  - Parallax suave pelo movimento do cursor e rotação manual interativa ao arrastar com mouse ou toque no celular.
- **Foco e Compatibilidade com TLauncher**:
  - Guia direto em 3 passos para quem usa TLauncher ou Minecraft original.
  - Sem necessidade de burocracias de login ou instalações complexas.
- **Área de Downloads Dupla**:
  - Botão de **Download do Modpack (.zip)** com tamanho, versão e SHA-256.
  - Botão de **Download do Launcher (.exe)** com instalador rápido.
  - Micro-interação de clique com cópia rápida do IP do servidor (`jogar.xyzarcraft.net`).

---

## 🚀 Como Executar

O projeto é 100% estático e sem dependências pesadas de build. Você pode abri-lo de qualquer uma das seguintes formas:

### Opção 1: Abrir diretamente no navegador
Basta dar duplo clique no arquivo [`index.html`](file:///C:/Users/amara/.gemini/antigravity/scratch/xyzarcraft-web/index.html).

### Opção 2: Com um servidor local (Live Server / Python / Node)
No PowerShell, dentro da pasta:
```powershell
python -m http.server 8080
```
E acesse `http://localhost:8080` no navegador.

---

## 🛠️ Personalização Rápida

- **Alterar links reais de download**: No arquivo [`app.js`](file:///C:/Users/amara/.gemini/antigravity/scratch/xyzarcraft-web/app.js) na função `triggerDownload()`, você pode substituir a geração do manifesto pelo link direto do seu Google Drive, Mediafire ou CDN.
- **Alterar IP do servidor**: Modifique a constante `jogar.xyzarcraft.net` em [`index.html`](file:///C:/Users/amara/.gemini/antigravity/scratch/xyzarcraft-web/index.html) e [`app.js`](file:///C:/Users/amara/.gemini/antigravity/scratch/xyzarcraft-web/app.js).
