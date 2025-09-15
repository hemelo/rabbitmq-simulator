# 🐰 RabbitMQ Simulator

> **An interactive visual simulator for learning and prototyping RabbitMQ message queue patterns**

## 📖 The Story Behind RabbitMQ Simulator

It all started with a simple question from a trainee coworker: *"How does RabbitMQ actually work?"* 

As a developer, I've always believed that the best way to understand complex systems is through visualization and hands-on experimentation. Traditional documentation and tutorials, while comprehensive, often leave learners struggling to grasp the dynamic nature of message queues - how messages flow, how exchanges route them, and how consumers process them in real-time.

So I set out to create something different: an interactive canvas where RabbitMQ concepts come to life. A place where you can drag and drop components, watch messages flow through the system, and experiment with different patterns without setting up a single server.

**RabbitMQ Simulator** was born from this need to make message queue concepts tangible and accessible. It's not just another tutorial - it's a playground where developers can experiment, learn, and understand the beautiful complexity of distributed messaging systems.

## ✨ Features

- 🎨 **Visual Drag & Drop Interface** - Build RabbitMQ topologies with an intuitive canvas
- 🔄 **Real-time Message Flow** - Watch messages flow through exchanges, queues, and consumers
- 📚 **Interactive Demos** - Pre-built scenarios for common patterns (E-commerce, Microservices, Fanout, etc.)
- 🎯 **Multiple Exchange Types** - Direct, Topic, Fanout, and Headers exchanges
- 📊 **Live Event Logging** - Track every message and event in real-time
- 💾 **Import/Export** - Save and share your configurations
- 🎮 **Interactive Controls** - Play, pause, restart, and step through simulations
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 🌙 **Dark/Light Mode** - Beautiful UI that adapts to your preference

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm, yarn, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/hemelo/rabbitmq-simulator.git
   cd rabbitmq-simulator
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:8080` and start exploring!

### Building for Production

```bash
npm run build
# or
yarn build
# or
bun run build
```

The built files will be in the `dist/` directory, ready to be deployed to any static hosting service.

## 🎯 How to Use

1. **Choose a Demo** - Start with one of the pre-built scenarios from the dropdown
2. **Build Your Own** - Drag components from the palette to the canvas
3. **Connect Components** - Create bindings between exchanges and queues
4. **Publish Messages** - Use the publish panel to send messages
5. **Watch the Magic** - Observe how messages flow through your topology
6. **Experiment** - Try different patterns and see how they behave

## 🏗️ Architecture

Built with modern web technologies:

- **React 18** - Component-based UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching

## 📚 Learning Resources

- [RabbitMQ Official Documentation](https://www.rabbitmq.com/)
- [Getting Started Guide](https://www.rabbitmq.com/getstarted.html)
- [JavaScript Tutorial](https://www.rabbitmq.com/tutorials/tutorial-one-javascript.html)
- [Message Patterns Explained](https://www.rabbitmq.com/tutorials/amqp-concepts.html)

## 🤝 Contributing

Contributions are welcome! Whether it's:
- 🐛 Bug fixes
- ✨ New features
- 📖 Documentation improvements
- 🎨 UI/UX enhancements

Please feel free to submit a Pull Request or open an Issue.

## 👨‍💻 Author

**Henrique Melo** - [@hemelo](https://github.com/hemelo)

- 🌐 Website: [hemelo.fyi](https://hemelo.fyi)
- 💼 LinkedIn: [henriquefcmelo](https://linkedin.com/in/henriquefcmelo)
- 📧 Email: [hemelo@pm.me](mailto:hemelo@pm.me)
- ☕ Support: [Ko-fi](https://ko-fi.com/hemelodev)

---

[![Built with React](https://img.shields.io/badge/Built%20with-React-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-38B2AC.svg)](https://tailwindcss.com/)

**Made with ❤️ by [Henrique Melo](https://hemelo.fyi)**

*Powered by [Cursor](https://cursor.sh/) and [Lovable](https://lovable.dev/)*