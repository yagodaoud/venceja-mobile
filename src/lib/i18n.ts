import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  pt: {
    translation: {
      // Auth
      login: 'Login',
      email: 'E-mail',
      password: 'Senha',
      enter: 'Entrar',
      invalidCredentials: 'Credenciais inválidas',
      loggingIn: 'Entrando...',

      // Dashboard
      dashboard: 'Dashboard',
      boletos: 'Boletos',
      noBoletos: 'Nenhum boleto encontrado',
      filterByStatus: 'Filtrar por status',
      all: 'Todos',
      pending: 'Pendente',
      expired: 'Vencido',
      paid: 'Pago',
      sortBy: 'Ordenar por',
      expirationDate: 'Data de vencimento',
      amount: 'Valor',
      supplier: 'Fornecedor',
      dueDate: 'Vencimento',
      expiringSoon: 'Vence em breve',
      expiringIn3Days: 'Vence nos próximos 3 dias',
      pullToRefresh: 'Puxe para atualizar',
      offlineMode: 'Modo offline – dados em cache',

      // Scan
      scan: 'Escanear',
      scanBoleto: 'Escanear Boleto',
      takePhoto: 'Tirar Foto',
      chooseFromGallery: 'Escolher da Galeria',
      scanning: 'Escaneando...',
      scanSuccess: 'Boleto escaneado com sucesso',
      scanError: 'Erro ao escanear. Edite manualmente.',
      editScanData: 'Editar Dados Escaneados',
      save: 'Salvar',
      cancel: 'Cancelar',

      // Payment
      markAsPaid: 'Marcar como Pago',
      markAsUnpaid: 'Marcar como Não Pago',
      addReceipt: 'Adicionar Comprovante',
      receipt: 'Comprovante',
      noReceipt: 'Sem comprovante',
      paymentSuccess: 'Pagamento registrado com sucesso',
      paymentError: 'Erro ao registrar pagamento',

      // Categories
      categories: 'Categorias',
      category: 'Categoria',
      createCategory: 'Criar Categoria',
      editCategory: 'Editar Categoria',
      deleteCategory: 'Excluir Categoria',
      categoryName: 'Nome da Categoria',
      categoryColor: 'Cor da Categoria',
      noCategories: 'Nenhuma categoria cadastrada',
      categoryCreated: 'Categoria criada com sucesso',
      categoryUpdated: 'Categoria atualizada com sucesso',
      categoryDeleted: 'Categoria excluída com sucesso',
      confirmDelete: 'Confirmar Exclusão',
      confirmDeleteMessage: 'Tem certeza que deseja excluir esta categoria?',

      // Reports
      reports: 'Relatórios',
      totalPaid: 'Total Pago',
      totalPending: 'Total Pendente',
      totalExpired: 'Total Vencido',
      byCategory: 'Por Categoria',
      exportCSV: 'Exportar CSV',
      dateRange: 'Período',
      thisMonth: 'Este Mês',
      last3Months: 'Últimos 3 Meses',
      thisYear: 'Este Ano',

      // Settings
      settings: 'Configurações',
      changePassword: 'Alterar Senha',
      currentPassword: 'Senha Atual',
      newPassword: 'Nova Senha',
      confirmPassword: 'Confirmar Senha',
      updateCNPJ: 'Atualizar CNPJ',
      darkMode: 'Modo Escuro',
      logout: 'Sair',
      passwordUpdated: 'Senha atualizada com sucesso',
      cnpjUpdated: 'CNPJ atualizado com sucesso',

      // Common
      edit: 'Editar',
      delete: 'Excluir',
      create: 'Criar',
      update: 'Atualizar',
      loading: 'Carregando...',
      error: 'Erro',
      success: 'Sucesso',
      confirm: 'Confirmar',
      close: 'Fechar',
      name: 'Nome',
      value: 'Valor',
      date: 'Data',
      status: 'Status',
      color: 'Cor',
      actions: 'Ações',
      required: 'Obrigatório',
      invalidValue: 'Valor inválido',
      invalidDate: 'Data inválida',
      futureDateRequired: 'Data deve ser futura',
      barcode: 'Código de Barras',
      optional: 'Opcional',

      // Validation
      requiredField: 'Este campo é obrigatório',
      minValue: 'Valor deve ser maior que zero',
      invalidEmail: 'E-mail inválido',
      passwordTooShort: 'Senha deve ter pelo menos 6 caracteres',
      passwordsDoNotMatch: 'Senhas não coincidem',

      // TODO: Future features
      // biometrics: 'Biometria',
      // barcodeScanner: 'Scanner de Código de Barras',
      // pushNotifications: 'Notificações Push',
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'pt',
    fallbackLng: 'pt',
    compatibilityJSON: 'v3',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

