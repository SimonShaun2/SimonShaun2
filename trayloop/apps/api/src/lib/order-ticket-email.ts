interface OrderTicketItem {
  name: string;
  quantity: number;
  totalPrice: number;
}

interface OrderTicketContext {
  merchantName: string;
  orderNumber: string;
  scheduledAt: Date | null;
  serviceType: string;
  totalAmount: number;
  currency: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string | null;
  customerCompany?: string | null;
  locationName?: string | null;
  locationAddress?: string | null;
  locationCity?: string | null;
  locationState?: string | null;
  notes?: string | null;
  items: OrderTicketItem[];
}

interface TicketAction {
  label: string;
  url: string;
  tone?: 'dark' | 'light';
}

interface TicketEmailResult {
  subject: string;
  text: string;
  html: string;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function formatEventDate(date: Date | null) {
  if (!date) return 'TBD';
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function formatServiceType(serviceType: string) {
  return ({
    delivery: 'Delivery',
    pickup: 'Pickup',
    full_service: 'Full Service',
    on_site: 'On-Site',
    food_truck: 'Food Truck',
  } as const)[serviceType as keyof {
    delivery: 'Delivery';
    pickup: 'Pickup';
    full_service: 'Full Service';
    on_site: 'On-Site';
    food_truck: 'Food Truck';
  }] ?? serviceType;
}

function renderSummaryRow(label: string, value: string) {
  return `<tr>
    <td style="padding:0 0 10px;color:#78716C;font-size:12px;letter-spacing:0.08em;text-transform:uppercase">${escapeHtml(label)}</td>
    <td style="padding:0 0 10px;color:#1C1917;font-size:14px;font-weight:600;text-align:right">${escapeHtml(value)}</td>
  </tr>`;
}

function renderActions(actions: TicketAction[]) {
  if (actions.length === 0) {
    return '';
  }

  return `<div style="margin-top:28px;display:flex;gap:12px;flex-wrap:wrap">
    ${actions
      .map((action) => {
        const dark = action.tone !== 'light';
        return `<a href="${action.url}" style="display:inline-block;padding:12px 18px;border-radius:999px;text-decoration:none;font-size:14px;font-weight:700;${
          dark
            ? 'background:#1C1917;color:#FFFFFF'
            : 'background:#FFFFFF;color:#1C1917;border:1px solid #D6D3D1'
        }">${escapeHtml(action.label)}</a>`;
      })
      .join('')}
  </div>`;
}

function renderItemsTable(items: OrderTicketItem[], currency: string) {
  if (items.length === 0) {
    return '<p style="margin:0;color:#78716C;font-size:14px">No line items were attached.</p>';
  }

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse">
    ${items
      .map(
        (item) => `<tr>
          <td style="padding:0 0 16px;vertical-align:top">
            <div style="display:inline-block;min-width:28px;padding:4px 0;border-radius:8px;background:#1C1917;color:#FFFFFF;font-size:12px;font-weight:700;text-align:center">${item.quantity}</div>
          </td>
          <td style="padding:0 16px 16px 12px;vertical-align:top">
            <div style="font-size:16px;font-weight:700;color:#1C1917">${escapeHtml(item.name)}</div>
          </td>
          <td style="padding:0 0 16px;text-align:right;vertical-align:top;font-size:15px;font-weight:700;color:#1C1917">${escapeHtml(
            formatCurrency(item.totalPrice, currency),
          )}</td>
        </tr>`,
      )
      .join('')}
  </table>`;
}

function renderTicketShell(input: {
  brandName: string;
  eyebrow: string;
  heading: string;
  intro: string;
  context: OrderTicketContext;
  summaryRows: Array<{ label: string; value: string }>;
  actions: TicketAction[];
  footerCopy: string;
}) {
  const { brandName, eyebrow, heading, intro, context, summaryRows, actions, footerCopy } = input;
  const locationBits = [context.locationAddress, [context.locationCity, context.locationState].filter(Boolean).join(', ')]
    .filter(Boolean)
    .join('<br>');

  return `<div style="background:#F5F5F4;padding:32px 12px;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1C1917">
    <div style="max-width:640px;margin:0 auto;background:#FFFFFF;border:1px solid #E7E5E4;border-radius:24px;overflow:hidden">
      <div style="padding:24px 28px;background:#1C1917;color:#FFFFFF">
        <div style="font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#FBBF24">${escapeHtml(eyebrow)}</div>
        <div style="font-size:34px;line-height:1.05;font-weight:800;margin-top:12px">${escapeHtml(heading)}</div>
        <div style="font-size:15px;line-height:1.7;color:#E7E5E4;margin-top:12px">${escapeHtml(intro)}</div>
      </div>
      <div style="padding:28px">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse">
          ${summaryRows.map((row) => renderSummaryRow(row.label, row.value)).join('')}
        </table>

        <div style="margin:18px 0 0;padding:18px 20px;border:1px solid #E7E5E4;border-radius:18px;background:#FAFAF9">
          <div style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#A16207">Preparation ticket</div>
          <div style="margin-top:14px">${renderItemsTable(context.items, context.currency)}</div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:18px">
          <div style="padding:18px;border:1px solid #E7E5E4;border-radius:18px">
            <div style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#78716C">Customer</div>
            <div style="margin-top:10px;font-size:17px;font-weight:700;color:#1C1917">${escapeHtml(context.customerName)}</div>
            ${context.customerCompany ? `<div style="margin-top:6px;font-size:14px;color:#57534E">${escapeHtml(context.customerCompany)}</div>` : ''}
            ${context.customerEmail ? `<div style="margin-top:6px;font-size:14px;color:#57534E">${escapeHtml(context.customerEmail)}</div>` : ''}
            ${context.customerPhone ? `<div style="margin-top:6px;font-size:14px;color:#57534E">${escapeHtml(context.customerPhone)}</div>` : ''}
          </div>
          <div style="padding:18px;border:1px solid #E7E5E4;border-radius:18px">
            <div style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#78716C">Service details</div>
            <div style="margin-top:10px;font-size:15px;font-weight:700;color:#1C1917">${escapeHtml(formatEventDate(context.scheduledAt))}</div>
            <div style="margin-top:6px;font-size:14px;color:#57534E">${escapeHtml(formatServiceType(context.serviceType))}</div>
            ${context.locationName ? `<div style="margin-top:6px;font-size:14px;color:#57534E">${escapeHtml(context.locationName)}</div>` : ''}
            ${locationBits ? `<div style="margin-top:6px;font-size:14px;color:#57534E;line-height:1.5">${locationBits}</div>` : ''}
          </div>
        </div>

        ${context.notes ? `<div style="margin-top:18px;padding:18px;border:1px solid #FCD34D;border-radius:18px;background:#FFFBEB">
          <div style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#92400E">Notes</div>
          <div style="margin-top:10px;font-size:14px;line-height:1.7;color:#78350F">${escapeHtml(context.notes)}</div>
        </div>` : ''}

        ${renderActions(actions)}
      </div>
      <div style="padding:18px 28px;border-top:1px solid #E7E5E4;background:#FAFAF9;font-size:12px;line-height:1.6;color:#78716C">
        ${escapeHtml(footerCopy)}
      </div>
    </div>
  </div>`;
}

export function renderCustomerOrderEmail(
  context: OrderTicketContext,
  variant: 'received' | 'confirmed' | 'completed' | 'cancelled',
  options?: { action?: TicketAction; reason?: string },
): TicketEmailResult {
  const variantCopy = {
    received: {
      subject: `Thanks for your order (${context.orderNumber})`,
      eyebrow: 'Order received',
      heading: 'Thanks for ordering with us',
      intro: `${context.merchantName} received your catering order and the team is reviewing it now.`,
      footer: 'Need to make an adjustment? Reply to this email and the merchant team will help you quickly.',
    },
    confirmed: {
      subject: `Your order is confirmed (${context.orderNumber})`,
      eyebrow: 'Order confirmed',
      heading: 'Your catering order is confirmed',
      intro: `${context.merchantName} confirmed your event and is preparing service details now.`,
      footer: 'You are all set. Keep this email handy for event-day details and follow-up updates.',
    },
    completed: {
      subject: `Thanks again for your event (${context.orderNumber})`,
      eyebrow: 'Order complete',
      heading: 'Thanks for ordering with us',
      intro: `${context.merchantName} marked your event complete. We would love to help with the next one too.`,
      footer: 'When you are ready to reorder, use the button above or reply here and the merchant can help.',
    },
    cancelled: {
      subject: `Update about your order (${context.orderNumber})`,
      eyebrow: 'Order cancelled',
      heading: 'Your order was cancelled',
      intro: options?.reason
        ? `${context.merchantName} cancelled this order. Reason: ${options.reason}`
        : `${context.merchantName} cancelled this order and will follow up if more context is needed.`,
      footer: 'If you would like to reschedule or place a replacement order, reply to this email directly.',
    },
  } as const;

  const copy = variantCopy[variant];
  const textLines = [
    copy.heading,
    '',
    copy.intro,
    '',
    `Order: ${context.orderNumber}`,
    `Event date: ${formatEventDate(context.scheduledAt)}`,
    `Service: ${formatServiceType(context.serviceType)}`,
    `Total: ${formatCurrency(context.totalAmount, context.currency)}`,
    ...(context.items.length > 0
      ? ['', 'Items:', ...context.items.map((item) => `- ${item.quantity} x ${item.name} (${formatCurrency(item.totalPrice, context.currency)})`)]
      : []),
    ...(context.notes ? ['', `Notes: ${context.notes}`] : []),
  ];

  return {
    subject: copy.subject,
    text: textLines.join('\n'),
    html: renderTicketShell({
      brandName: context.merchantName,
      eyebrow: copy.eyebrow,
      heading: copy.heading,
      intro: copy.intro,
      context,
      summaryRows: [
        { label: 'Order', value: context.orderNumber },
        { label: 'Event date', value: formatEventDate(context.scheduledAt) },
        { label: 'Service', value: formatServiceType(context.serviceType) },
        { label: 'Total', value: formatCurrency(context.totalAmount, context.currency) },
      ],
      actions: options?.action ? [options.action] : [],
      footerCopy: copy.footer,
    }),
  };
}

export function renderMerchantOrderTicketEmail(
  context: OrderTicketContext,
  options: {
    dashboardUrl: string;
    acceptUrl?: string;
    depositRequired: boolean;
  },
): TicketEmailResult {
  const actions: TicketAction[] = [];
  if (options.acceptUrl) {
    actions.push({ label: 'Accept order', url: options.acceptUrl, tone: 'dark' });
  }
  actions.push({ label: 'Open in dashboard', url: options.dashboardUrl, tone: 'light' });

  const prepNote = options.depositRequired
    ? 'This order still needs a deposit step before it can move into confirmed status.'
    : 'You can accept this order directly from the email or continue in the merchant dashboard.';

  const textLines = [
    `New catering order ${context.orderNumber}`,
    '',
    `Customer: ${context.customerName}`,
    ...(context.customerCompany ? [`Company: ${context.customerCompany}`] : []),
    ...(context.customerEmail ? [`Email: ${context.customerEmail}`] : []),
    ...(context.customerPhone ? [`Phone: ${context.customerPhone}`] : []),
    `Event date: ${formatEventDate(context.scheduledAt)}`,
    `Service: ${formatServiceType(context.serviceType)}`,
    `Total: ${formatCurrency(context.totalAmount, context.currency)}`,
    ...(context.items.length > 0
      ? ['', 'Items:', ...context.items.map((item) => `- ${item.quantity} x ${item.name} (${formatCurrency(item.totalPrice, context.currency)})`)]
      : []),
    ...(context.notes ? ['', `Notes: ${context.notes}`] : []),
    '',
    prepNote,
  ];

  return {
    subject: `New catering order - ${context.orderNumber}`,
    text: textLines.join('\n'),
    html: renderTicketShell({
      brandName: context.merchantName,
      eyebrow: 'New order',
      heading: 'New catering order ready for review',
      intro: prepNote,
      context,
      summaryRows: [
        { label: 'Order', value: context.orderNumber },
        { label: 'Event date', value: formatEventDate(context.scheduledAt) },
        { label: 'Service', value: formatServiceType(context.serviceType) },
        { label: 'Total', value: formatCurrency(context.totalAmount, context.currency) },
      ],
      actions,
      footerCopy: 'This ticket matches the merchant dashboard order so the team can review, confirm, and prepare service without switching formats.',
    }),
  };
}

export function renderOrderActionResultHtml(input: {
  title: string;
  body: string;
  dashboardUrl: string;
  success: boolean;
}) {
  return `<div style="background:#F5F5F4;min-height:100vh;padding:48px 16px;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1C1917">
    <div style="max-width:560px;margin:0 auto;background:#FFFFFF;border:1px solid #E7E5E4;border-radius:24px;overflow:hidden">
      <div style="padding:24px 28px;background:${input.success ? '#166534' : '#1C1917'};color:#FFFFFF">
        <div style="font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${input.success ? '#DCFCE7' : '#FBBF24'}">TrayLoop</div>
        <div style="font-size:30px;line-height:1.1;font-weight:800;margin-top:12px">${escapeHtml(input.title)}</div>
      </div>
      <div style="padding:28px">
        <p style="margin:0;font-size:15px;line-height:1.8;color:#44403C">${escapeHtml(input.body)}</p>
        <a href="${input.dashboardUrl}" style="display:inline-block;margin-top:24px;padding:12px 18px;border-radius:999px;background:#1C1917;color:#FFFFFF;text-decoration:none;font-size:14px;font-weight:700">Open order in dashboard</a>
      </div>
    </div>
  </div>`;
}
