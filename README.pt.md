# 🐰 RabbitMQ Simulator

> **Um simulador visual interativo para aprender e prototipar padrões de filas de mensagens RabbitMQ**

## 📖 A História por Trás do RabbitMQ Simulator

Tudo começou com uma pergunta simples de um estagiário colega de trabalho: *"Como o RabbitMQ realmente funciona?"*

Como desenvolvedor, sempre acreditei que a melhor forma de entender sistemas complexos é através de visualização e experimentação prática. Documentação e tutoriais tradicionais, embora abrangentes, frequentemente deixam os aprendizes lutando para compreender a natureza dinâmica das filas de mensagens - como as mensagens fluem, como os exchanges as roteiam, e como os consumidores as processam em tempo real.

Então me propus a criar algo diferente: uma tela interativa onde os conceitos do RabbitMQ ganham vida. Um lugar onde você pode arrastar e soltar componentes, assistir mensagens fluindo pelo sistema, e experimentar diferentes padrões sem configurar um único servidor.

O **RabbitMQ Simulator** nasceu dessa necessidade de tornar os conceitos de filas de mensagens tangíveis e acessíveis. Não é apenas mais um tutorial - é um playground onde desenvolvedores podem experimentar, aprender e entender a bela complexidade dos sistemas de mensageria distribuída.

## ✨ Funcionalidades

- 🎨 **Interface Visual Drag & Drop** - Construa topologias RabbitMQ com uma tela intuitiva
- 🔄 **Fluxo de Mensagens em Tempo Real** - Assista mensagens fluindo através de exchanges, filas e consumidores
- 📚 **Demos Interativos** - Cenários pré-construídos para padrões comuns (E-commerce, Microserviços, Fanout, etc.)
- 🎯 **Múltiplos Tipos de Exchange** - Exchanges Direct, Topic, Fanout e Headers
- 📊 **Log de Eventos ao Vivo** - Acompanhe cada mensagem e evento em tempo real
- 💾 **Importar/Exportar** - Salve e compartilhe suas configurações
- 🎮 **Controles Interativos** - Reproduzir, pausar, reiniciar e percorrer simulações
- 📱 **Design Responsivo** - Funciona perfeitamente em desktop e dispositivos móveis
- 🌙 **Modo Escuro/Claro** - Interface bonita que se adapta à sua preferência

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+
- npm, yarn ou bun

### Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/hemelo/rabbitmq-simulator.git
   cd rabbitmq-simulator
   ```

2. **Instale as dependências**
   ```bash
   npm install
   # ou
   yarn install
   # ou
   bun install
   ```

3. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   # ou
   yarn dev
   # ou
   bun dev
   ```

4. **Abra seu navegador**
   Navegue para `http://localhost:8080` e comece a explorar!

### Construindo para Produção

```bash
npm run build
# ou
yarn build
# ou
bun run build
```

Os arquivos construídos estarão no diretório `dist/`, prontos para serem implantados em qualquer serviço de hospedagem estática.

## 🎯 Como Usar

1. **Escolha uma Demo** - Comece com um dos cenários pré-construídos do dropdown
2. **Construa a Sua Própria** - Arraste componentes da paleta para a tela
3. **Conecte Componentes** - Crie bindings entre exchanges e filas
4. **Publique Mensagens** - Use o painel de publicação para enviar mensagens
5. **Assista a Mágica** - Observe como as mensagens fluem através da sua topologia
6. **Experimente** - Tente diferentes padrões e veja como eles se comportam

## 🏗️ Arquitetura

Construído com tecnologias web modernas:

- **React 18** - Framework de UI baseado em componentes
- **TypeScript** - Desenvolvimento com segurança de tipos
- **Tailwind CSS** - Estilização utility-first
- **Radix UI** - Primitivos de componentes acessíveis
- **Vite** - Ferramenta de build rápida e servidor de desenvolvimento
- **React Router** - Roteamento do lado do cliente
- **React Query** - Busca de dados e cache

## 📚 Recursos de Aprendizado

- [Documentação Oficial do RabbitMQ](https://www.rabbitmq.com/)
- [Guia de Início](https://www.rabbitmq.com/getstarted.html)
- [Tutorial JavaScript](https://www.rabbitmq.com/tutorials/tutorial-one-javascript.html)
- [Padrões de Mensagem Explicados](https://www.rabbitmq.com/tutorials/amqp-concepts.html)

## 🤝 Contribuindo

Contribuições são bem-vindas! Seja:
- 🐛 Correções de bugs
- ✨ Novas funcionalidades
- 📖 Melhorias na documentação
- 🎨 Melhorias de UI/UX

Sinta-se à vontade para enviar um Pull Request ou abrir uma Issue.

## 👨‍💻 Autor

**Henrique Melo** - [@hemelo](https://github.com/hemelo)

- 🌐 Website: [hemelo.fyi](https://hemelo.fyi)
- 💼 LinkedIn: [henriquefcmelo](https://linkedin.com/in/henriquefcmelo)
- 📧 Email: [hemelo@pm.me](mailto:hemelo@pm.me)
- ☕ Suporte: [Ko-fi](https://ko-fi.com/hemelodev)

---

[![Construído com React](https://img.shields.io/badge/Construído%20com-React-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-38B2AC.svg)](https://tailwindcss.com/)

**Feito com ❤️ por [Henrique Melo](https://hemelo.fyi)**

*Desenvolvido com [Cursor](https://cursor.sh/) e [Lovable](https://lovable.dev/)*
