export const paymentRequestTranslations = {
  en: {
    create: {
      title: 'Request Payment',
      amount: 'Amount',
      currency: 'Currency',
      message: 'Message (optional)',
      recipient: 'Recipient',
      expiry: 'Expires in',
      submit: 'Send Request',
      success: 'Payment request sent successfully',
      error: 'Error sending payment request',
    },
    list: {
      sent: 'Sent Requests',
      received: 'Received Requests',
      empty: 'No payment requests',
      amount: 'Amount',
      status: 'Status',
      date: 'Date',
      message: 'Message',
      actions: 'Actions',
    },
    status: {
      pending: 'Pending',
      paid: 'Paid',
      declined: 'Declined',
      expired: 'Expired',
    },
    actions: {
      pay: 'Pay',
      decline: 'Decline',
      cancel: 'Cancel',
    },
    notifications: {
      received: {
        title: 'New Payment Request',
        body: '{{sender}} requested {{amount}} {{currency}}',
      },
      paid: {
        title: 'Payment Request Paid',
        body: '{{receiver}} paid your request for {{amount}} {{currency}}',
      },
      declined: {
        title: 'Payment Request Declined',
        body: '{{receiver}} declined your request for {{amount}} {{currency}}',
      },
      expired: {
        title: 'Payment Request Expired',
        body: 'Your request for {{amount}} {{currency}} has expired',
      },
    },
  },
  ar: {
    create: {
      title: 'طلب الدفع',
      amount: 'المبلغ',
      currency: 'العملة',
      message: 'الرسالة (اختياري)',
      recipient: 'المستلم',
      expiry: 'ينتهي في',
      submit: 'إرسال الطلب',
      success: 'تم إرسال طلب الدفع بنجاح',
      error: 'خطأ في إرسال طلب الدفع',
    },
    list: {
      sent: 'الطلبات المرسلة',
      received: 'الطلبات المستلمة',
      empty: 'لا توجد طلبات دفع',
      amount: 'المبلغ',
      status: 'الحالة',
      date: 'التاريخ',
      message: 'الرسالة',
      actions: 'الإجراءات',
    },
    status: {
      pending: 'قيد الانتظار',
      paid: 'مدفوع',
      declined: 'مرفوض',
      expired: 'منتهي',
    },
    actions: {
      pay: 'دفع',
      decline: 'رفض',
      cancel: 'إلغاء',
    },
    notifications: {
      received: {
        title: 'طلب دفع جديد',
        body: 'طلب {{sender}} مبلغ {{amount}} {{currency}}',
      },
      paid: {
        title: 'تم دفع طلب الدفع',
        body: 'دفع {{receiver}} طلبك بمبلغ {{amount}} {{currency}}',
      },
      declined: {
        title: 'تم رفض طلب الدفع',
        body: 'رفض {{receiver}} طلبك بمبلغ {{amount}} {{currency}}',
      },
      expired: {
        title: 'انتهى طلب الدفع',
        body: 'انتهى طلبك بمبلغ {{amount}} {{currency}}',
      },
    },
  },
  fr: {
    create: {
      title: 'Demander un Paiement',
      amount: 'Montant',
      currency: 'Devise',
      message: 'Message (optionnel)',
      recipient: 'Bénéficiaire',
      expiry: 'Expire dans',
      submit: 'Envoyer la Demande',
      success: 'Demande de paiement envoyée avec succès',
      error: 'Erreur lors de l\'envoi de la demande de paiement',
    },
    list: {
      sent: 'Demandes Envoyées',
      received: 'Demandes Reçues',
      empty: 'Aucune demande de paiement',
      amount: 'Montant',
      status: 'Statut',
      date: 'Date',
      message: 'Message',
      actions: 'Actions',
    },
    status: {
      pending: 'En Attente',
      paid: 'Payé',
      declined: 'Refusé',
      expired: 'Expiré',
    },
    actions: {
      pay: 'Payer',
      decline: 'Refuser',
      cancel: 'Annuler',
    },
    notifications: {
      received: {
        title: 'Nouvelle Demande de Paiement',
        body: '{{sender}} a demandé {{amount}} {{currency}}',
      },
      paid: {
        title: 'Demande de Paiement Payée',
        body: '{{receiver}} a payé votre demande de {{amount}} {{currency}}',
      },
      declined: {
        title: 'Demande de Paiement Refusée',
        body: '{{receiver}} a refusé votre demande de {{amount}} {{currency}}',
      },
      expired: {
        title: 'Demande de Paiement Expirée',
        body: 'Votre demande de {{amount}} {{currency}} a expiré',
      },
    },
  },
  ber: {
    create: {
      title: 'Ssuter Afran',
      amount: 'Amḍan',
      currency: 'Adrim',
      message: 'Izen (optional)',
      recipient: 'Aneflay',
      expiry: 'Yemmut di',
      submit: 'Azen Asuter',
      success: 'Asuter n ufran yettwazen akken ilaḥ',
      error: 'Tuccḍa di uzen n asuter n ufran',
    },
    list: {
      sent: 'Isutran Yettwaznen',
      received: 'Isutran Yettwaren',
      empty: 'Ulac isutran n ufran',
      amount: 'Amḍan',
      status: 'Aḥwal',
      date: 'Azemz',
      message: 'Izen',
      actions: 'Igzulan',
    },
    status: {
      pending: 'Yerra',
      paid: 'Yeffer',
      declined: 'Yugi',
      expired: 'Yemmut',
    },
    actions: {
      pay: 'Efru',
      decline: 'Ggi',
      cancel: 'Sefsex',
    },
    notifications: {
      received: {
        title: 'Asuter Amaynut n Ufran',
        body: '{{sender}} issuter {{amount}} {{currency}}',
      },
      paid: {
        title: 'Asuter n Ufran Yeffer',
        body: '{{receiver}} yeffer asuter-ik n {{amount}} {{currency}}',
      },
      declined: {
        title: 'Asuter n Ufran Yugi',
        body: '{{receiver}} yugi asuter-ik n {{amount}} {{currency}}',
      },
      expired: {
        title: 'Asuter n Ufran Yemmut',
        body: 'Asuter-ik n {{amount}} {{currency}} yemmut',
      },
    },
  },
}; 