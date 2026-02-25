# 🌀 CyberBeasts: Core Conquest

Bem-vindo ao Nexoverse! Este projeto foi inicializado seguindo a documentação oficial.

## 🚀 Como Rodar o Jogo Localmente

Como este é um projeto baseado em **Vite**, você precisará do Node.js instalado.

1. Abra o terminal na pasta do projeto.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. O Vite fornecerá um link (ex: `http://localhost:5173`). Abra-o no seu navegador.

## 🛠️ Estrutura Atual (Sprint 1)
- [x] **Grid 6x6**: Renderizado via JavaScript com zonas de Spawn e Core Nexus.
- [x] **Design System**: Tema Cyberpunk Glitch implementado em CSS.
- [x] **Entidades**: Classe base `CyberBeast` criada com a matriz de atributos original.
- [x] **Deploy**: GitHub Action configurada (`.github/workflows/deploy.yml`).

## 📡 Próximos Passos (Sprint 2)
- Implementar o componente visual da **Data Wheel (Roleta)**.
- Adicionar lógica de movimento e colisão.
- Renderizar os primeiros CyberBeasts no Grid.
