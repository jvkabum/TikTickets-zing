const routes = [
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    redirect: { name: 'home' },
    children: [
      { path: '', component: () => import('../pages/dashboard/Dashboard.vue') },
      {
        path: '/home',
        name: 'home-dashboard',
        component: () => import('../pages/dashboard/Dashboard.vue')
      },
      {
        path: '/painel-atendimentos',
        name: 'painel-atendimentos',
        component: () => import('../pages/dashboard/DashTicketsFilas.vue')
      },
      {
        path: '/sessoes',
        name: 'sessoes',
        component: () => import('../pages/sessaoWhatsapp/SessaoWhatsapp.vue')
      },
      {
        path: '/contatos',
        name: 'contatos',
        component: () => import('../pages/contatos/Contatos.vue')
      },
      {
        path: '/usuarios',
        name: 'usuarios',
        component: () => import('../pages/usuarios/Usuarios.vue')
      },
      {
        path: '/auto-resposta',
        name: 'auto-resposta',
        component: () => import('../pages/fluxoAutoResposta/FluxoAutoResposta.vue')
      },
      {
        path: '/mensagens-rapidas',
        name: 'mensagens-rapidas',
        component: () => import('../pages/mensagensRapidas/MensagensRapidas.vue')
      },
      {
        path: '/filas',
        name: 'filas',
        component: () => import('../pages/filas/Filas.vue')
      },
      {
        path: '/configuracoes',
        name: 'configuracoes',
        component: () => import('../pages/configuracoes/Configuracoes.vue')
      },
      {
        path: '/etiquetas',
        name: 'etiquetas',
        component: () => import('../pages/etiquetas/Etiquetas.vue')
      },
      {
        path: '/campanhas',
        name: 'campanhas',
        component: () => import('../pages/campanhas/Campanhas.vue')
      },
      {
        path: '/campanhas/:campanhaId',
        name: 'contatos-campanha',
        component: () => import('../pages/campanhas/ContatosCampanha.vue')
      },
      {
        path: '/horario-atendimento',
        name: 'horarioAtendimento',
        component: () => import('../pages/horarioAtendimento/HorarioAtendimento.vue')
      },
      {
        path: '/api-service',
        name: 'api-service',
        component: () => import('../pages/api/Api.vue')
      },
      {
        path: '/sessaosuper',
        name: 'sessaosuper',
        component: () => import('../pages/sessaosuper/SessaoSuper.vue')
      },
      {
        path: '/usuariossuper',
        name: 'usuariossuper',
        component: () => import('../pages/usuariossuper/UsuariosSuperPagina.vue')
      },
      {
        path: '/empresassuper',
        name: 'empresassuper',
        component: () => import('../pages/empresassuper/EmpresasSuper.vue')
      },
      {
        path: '/chat-flow',
        component: () => import('../pages/chatFlow/ChatFlowPagina.vue'),
        redirect: 'chat-flow',
        children: [
          {
            path: '',
            name: 'chat-flow',
            component: () => import('../pages/chatFlow/ListaChatFlow.vue')
          },
          {
            path: 'builder',
            name: 'chat-flow-builder',
            component: () => import('../components/ccFlowBuilder/panel.vue')
          }
        ]
      }
    ]
  },
  {
    path: '/relatorios',
    redirect: 'relatorios',
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'relatorios',
        component: () => import('../pages/relatorios/ccListaRelatorios.vue')
      },
      {
        path: 'estatisticas-atendimentos-usuarios',
        name: 'estatisticas-atendimentos-usuarios',
        component: () => import('../pages/relatorios/RelatorioResumoAtendimentosUsuarios.vue')
      },
      {
        path: 'lista-contatos',
        name: 'lista-contatos',
        component: () => import('../pages/relatorios/RelatorioContatosGeral.vue')
      },
      {
        path: 'contatos-por-etiquetas',
        name: 'contatos-por-etiquetas',
        component: () => import('../pages/relatorios/RelatorioContatosEtiquetas.vue')
      },
      {
        path: 'contatos-por-estado',
        name: 'contatos-por-estado',
        component: () => import('../pages/relatorios/RelatorioContatosEstado.vue')
      }
    ]
  },
  {
    path: '/atendimento',
    name: 'atendimento',
    // redirect: { name: 'chat-empty' },
    component: () => import('../pages/atendimento/Atendimento.vue'),
    children: [
      {
        path: '/chats/',
        name: 'chat-empty',
        component: () => import('../pages/atendimento/Chat.vue')
      },
      {
        path: ':ticketId',
        name: 'chat',
        component: () => import('../pages/atendimento/Chat.vue')
      },
      {
        path: 'contatos',
        name: 'chat-contatos',
        component: () => import('../pages/contatos/Contatos.vue'),
        props: { isChatContact: true }
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('../pages/Error404.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../pages/Login.vue')
  }
]

export default routes
