# VenceJá Mobile

MVP mobile para gerenciamento de boletos em restaurantes brasileiros, desenvolvido com React Native (Expo).

## 🚀 Tecnologias

- **Expo SDK 51+**
- **React Native 0.74+**
- **TypeScript**
- **React Navigation** (Stack + Bottom Tabs)
- **Zustand** (State Management)
- **React Query** (Data Fetching & Caching)
- **NativeWind** (Tailwind para React Native)
- **React Native Paper** (UI Components)
- **React Hook Form + Zod** (Form Validation)
- **i18next** (Internacionalização PT-BR)

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app no dispositivo (iOS/Android)

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd venceja-mobile
```

2. Instale as dependências:
```bash
npm install
```

3. Configure a URL da API no `app.json`:
```json
{
  "extra": {
    "apiUrl": "http://localhost:8080/api/v1"
  }
}
```

Para dispositivos físicos, use o IP da sua máquina:
```json
{
  "extra": {
    "apiUrl": "http://192.168.1.100:8080/api/v1"
  }
}
```

## 🏃 Executando

1. Inicie o servidor Expo:
```bash
npm start
```

2. Escaneie o QR code com:
   - **iOS**: Câmera app ou Expo Go
   - **Android**: Expo Go app

3. Ou execute em um emulador:
```bash
npm run android  # Android
npm run ios      # iOS
```

## 📱 Funcionalidades

### Must (Implementado)

- ✅ **Autenticação**: Login com email/senha, token armazenado com SecureStore
- ✅ **Dashboard**: Lista de boletos com filtros, ordenação e paginação
- ✅ **Escanear**: Câmera/galeria para escanear boletos (OCR)
- ✅ **Marcar como Pago**: Toggle de status com opção de comprovante
- ✅ **Categorias**: CRUD completo de categorias com cores
- ✅ **Relatórios**: Totais e gráficos por categoria
- ✅ **Configurações**: Alterar senha, CNPJ, modo escuro

### Should (Implementado)

- ✅ **Relatórios**: Filtros por período, exportação CSV
- ✅ **Offline**: Cache com React Query, dados dummy para testes

### Could (Comentado para futuro)

- ⏳ Biometria (expo-local-authentication)
- ⏳ Scanner de código de barras (expo-barcode-scanner)
- ⏳ Notificações push completas (expo-notifications com webhook)

## 📁 Estrutura do Projeto

```
src/
├── components/     # Componentes reutilizáveis
│   ├── BoletoCard.tsx
│   ├── PaymentModal.tsx
│   ├── ScanModal.tsx
│   └── CategoryPicker.tsx
├── hooks/         # Hooks customizados
│   ├── useAuth.ts
│   ├── useBoletos.ts
│   └── useCategories.ts
├── lib/           # Utilitários e configurações
│   ├── api.ts
│   ├── utils.ts
│   └── i18n.ts
├── navigation/    # Navegação
│   └── AppNavigator.tsx
├── screens/       # Telas
│   ├── LoginScreen.tsx
│   ├── DashboardScreen.tsx
│   ├── ScanScreen.tsx
│   ├── CategoriesScreen.tsx
│   ├── ReportsScreen.tsx
│   └── SettingsScreen.tsx
├── store/         # Estado global (Zustand)
│   └── authStore.ts
└── types/         # TypeScript types
    └── index.ts
```

## 🔧 Configuração da API

A aplicação espera uma API REST com os seguintes endpoints:

- `POST /auth/login` - Autenticação
- `GET /boletos` - Listar boletos (com filtros)
- `POST /boletos` - Criar boleto
- `PUT /boletos/:id` - Atualizar boleto
- `DELETE /boletos/:id` - Deletar boleto
- `POST /boletos/scan` - Escanear boleto (OCR)
- `PUT /boletos/:id/pagar` - Marcar como pago
- `GET /categorias` - Listar categorias
- `POST /categorias` - Criar categoria
- `PUT /categorias/:id` - Atualizar categoria
- `DELETE /categorias/:id` - Deletar categoria

## 📝 Dados Dummy

A aplicação inclui dados dummy para testes offline:
- 3 boletos de exemplo
- 3 categorias de exemplo

## 🎨 Design System

- **Cor Primária**: #A7B758 (Olive Green)
- **Status Pendente**: #FF9800 (Laranja)
- **Status Vencido**: #F44336 (Vermelho)
- **Status Pago**: #A7B758 (Olive Green)
- **Fonte**: Roboto (sistema)

## 🔒 Segurança

- Token JWT armazenado com `expo-secure-store`
- Auto-logout em 401
- Validação de formulários com Zod
- Sanitização de inputs

## 📱 Testes

Execute os testes:
```bash
npm test
```

## 🚀 Build

Para criar um build de produção:
```bash
expo build:android
expo build:ios
```

Ou use EAS Build:
```bash
eas build --platform android
eas build --platform ios
```

## 📄 Licença

MIT

## 👥 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para suporte, envie um email para suporte@venceja.com ou abra uma issue no GitHub.

