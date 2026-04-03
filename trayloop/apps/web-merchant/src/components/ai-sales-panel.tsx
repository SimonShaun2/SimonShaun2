'use client';

import type { CSSProperties } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  createAiSalesCampaign,
  fetchAiSalesCampaigns,
  fetchAiSalesReorderOpportunities,
  fetchAiSalesSummary,
  fetchAiSalesTargets,
  generateAiSalesMessage,
  type AiSalesCampaign,
  type AiSalesGenerateResult,
  type AiSalesReorderOpportunity,
  type AiSalesReactivationSummary,
  type AiSalesTarget,
} from '../lib/api';
import { useMobile } from '../lib/use-mobile';

type BuilderSegment = 'frequent' | 'at_risk' | 'dormant';
type CampaignKind = 'reactivation' | 'reorder_reminder';

const SEGMENT_COPY: Record<
  BuilderSegment,
  { title: string; description: string; empty: string }
> = {
  frequent: {
    title: 'Likely reorder customers',
    description: 'These regulars are close to their usual reorder window. A timely reminder can pull the next order forward.',
    empty: 'No likely reorder customers right now.',
  },
  at_risk: {
    title: 'At-risk repeat customers',
    description: 'These customers are still warm. Reach back out before the reorder window slips.',
    empty: 'No at-risk repeat customers right now.',
  },
  dormant: {
    title: 'Dormant repeat customers',
    description: 'These customers have gone quiet. A well-timed reactivation message can bring them back.',
    empty: 'No dormant repeat customers right now.',
  },
};

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDate(value: string | null) {
  if (!value) return 'Not sent';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function segmentLabel(segment: BuilderSegment) {
  if (segment === 'at_risk') return 'At-risk';
  if (segment === 'dormant') return 'Dormant';
  return 'Frequent';
}

function campaignStatusLabel(campaign: AiSalesCampaign) {
  if (campaign.status === 'sent') {
    return campaign.recipientSummary.failed > 0
      ? `Sent with ${campaign.recipientSummary.failed} failed`
      : `Sent to ${campaign.recipientSummary.sent || campaign.selectedTargetCount}`;
  }

  if (campaign.status === 'copied') {
    return `SMS copied for ${campaign.selectedTargetCount}`;
  }

  return 'Draft saved';
}

export default function AiSalesPanel() {
  const isMobile = useMobile();
  const [summary, setSummary] = useState<AiSalesReactivationSummary | null>(null);
  const [campaigns, setCampaigns] = useState<AiSalesCampaign[]>([]);
  const [reorderOpportunities, setReorderOpportunities] = useState<AiSalesReorderOpportunity[]>([]);
  const [targets, setTargets] = useState<AiSalesTarget[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<BuilderSegment>('at_risk');
  const [campaignKind, setCampaignKind] = useState<CampaignKind>('reactivation');
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [generated, setGenerated] = useState<AiSalesGenerateResult | null>(null);
  const [goalNotes, setGoalNotes] = useState('');
  const [toneNotes, setToneNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [targetsLoading, setTargetsLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pendingSeedCustomerIds, setPendingSeedCustomerIds] = useState<string[] | null>(null);

  useEffect(() => {
    void loadPanel();
  }, []);

  useEffect(() => {
    if (!isBuilderOpen) return;
    void loadTargets(selectedSegment, pendingSeedCustomerIds);
  }, [isBuilderOpen, selectedSegment, pendingSeedCustomerIds]);

  const selectedTargets = useMemo(
    () => targets.filter((target) => selectedCustomerIds.includes(target.id)),
    [selectedCustomerIds, targets],
  );

  const selectedRevenueCents = useMemo(
    () =>
      selectedTargets.reduce(
        (total, target) => total + target.averageOrderValueCents,
        0,
      ),
    [selectedTargets],
  );

  const actionableSummary = useMemo(() => {
    if (!summary) return null;

    return {
      atRiskCount: summary.segments.at_risk.count,
      dormantCount: summary.segments.dormant.count,
      potentialRevenueCents: summary.actionablePotentialRevenueCents,
    };
  }, [summary]);

  const builderSegments = useMemo<BuilderSegment[]>(
    () => (selectedSegment === 'frequent' ? ['frequent', 'at_risk', 'dormant'] : ['at_risk', 'dormant']),
    [selectedSegment],
  );

  async function loadPanel() {
    setLoading(true);
    setError('');

    try {
      const [summaryData, campaignData, reorderData] = await Promise.all([
        fetchAiSalesSummary(),
        fetchAiSalesCampaigns(5),
        fetchAiSalesReorderOpportunities(5),
      ]);
      setSummary(summaryData);
      setCampaigns(campaignData);
      setReorderOpportunities(reorderData.data);

      if (summaryData.segments.at_risk.count === 0 && summaryData.segments.dormant.count > 0) {
        setSelectedSegment('dormant');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load AI sales data.');
    } finally {
      setLoading(false);
    }
  }

  async function loadTargets(segment: BuilderSegment, seedCustomerIds: string[] | null = null) {
    setTargetsLoading(true);
    setError('');
    setGenerated(null);
    setSuccess('');

    try {
      const response = await fetchAiSalesTargets({ segment, page: 1, pageSize: 100 });
      setTargets(response.data);
      const defaultSelection = response.data.map((target) => target.id);
      const filteredSeedSelection = seedCustomerIds
        ? defaultSelection.filter((id) => seedCustomerIds.includes(id))
        : defaultSelection;
      setSelectedCustomerIds(filteredSeedSelection);
      setPendingSeedCustomerIds(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load repeat customers.');
    } finally {
      setTargetsLoading(false);
    }
  }

  function openBuilder() {
    setCampaignKind('reactivation');
    setIsBuilderOpen(true);
    setSuccess('');
    setError('');
  }

  function closeBuilder() {
    setIsBuilderOpen(false);
    setCampaignKind('reactivation');
    setGenerated(null);
    setGoalNotes('');
    setToneNotes('');
    setTargets([]);
    setSelectedCustomerIds([]);
    setPendingSeedCustomerIds(null);
    setError('');
  }

  function openReorderReminder(opportunity: AiSalesReorderOpportunity) {
    setCampaignKind('reorder_reminder');
    setSelectedSegment(opportunity.segment);
    setPendingSeedCustomerIds([opportunity.customerId]);
    setGoalNotes(
      `Invite ${opportunity.name} to book their next catering order around their normal ${opportunity.cadenceDays}-day cadence.`,
    );
    setToneNotes('Warm, confident, concise, and timely.');
    setGenerated(null);
    setSuccess('');
    setError('');
    setIsBuilderOpen(true);
  }

  function toggleCustomer(customerId: string) {
    setGenerated(null);
    setSelectedCustomerIds((current) =>
      current.includes(customerId)
        ? current.filter((id) => id !== customerId)
        : [...current, customerId],
    );
  }

  function selectAll() {
    setGenerated(null);
    setSelectedCustomerIds(targets.map((target) => target.id));
  }

  function clearSelection() {
    setGenerated(null);
    setSelectedCustomerIds([]);
  }

  async function handleGenerate() {
    if (selectedCustomerIds.length === 0) {
      setError('Select at least one repeat customer before generating a message.');
      return;
    }

    setGenerating(true);
    setError('');
    setSuccess('');

    try {
      const result = await generateAiSalesMessage({
        segment: selectedSegment,
        selectedCustomerIds,
        channelIntent: 'email',
        campaignKind,
        goalNotes: goalNotes.trim() || undefined,
        toneNotes: toneNotes.trim() || undefined,
      });
      setGenerated(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate outreach copy.');
    } finally {
      setGenerating(false);
    }
  }

  async function handleCampaignAction(status: 'draft' | 'sent' | 'copied', channel: 'email' | 'sms_copy') {
    if (!generated) {
      setError('Generate your message before saving or sending.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      if (status === 'copied') {
        await navigator.clipboard.writeText(generated.generated.smsBody);
      }

      const campaign = await createAiSalesCampaign({
        segment: selectedSegment,
        channel,
        status,
        selectedCustomerIds,
        generatedSubject: generated.generated.subject,
        generatedEmailBody: generated.generated.emailBody,
        generatedSmsBody: generated.generated.smsBody,
      });

      await loadPanel();
      closeBuilder();

      if (status === 'sent') {
        setSuccess(
          campaign.recipientSummary.failed > 0
            ? `Campaign sent with ${campaign.recipientSummary.failed} delivery failures.`
            : `Campaign sent to ${campaign.recipientSummary.sent || campaign.selectedTargetCount} repeat customers.`,
        );
      } else if (status === 'copied') {
        setSuccess('SMS copy saved and placed on your clipboard.');
      } else {
        setSuccess('Campaign draft saved.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Campaign action failed.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div style={panelStyle}>
        <div style={{ color: '#78716C', fontSize: 14 }}>Loading AI sales engine...</div>
      </div>
    );
  }

  return (
    <div style={panelStyle}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 16,
          marginBottom: 18,
        }}
      >
        <div>
          <div style={eyebrowStyle}>AI sales engine</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1C1917', margin: '4px 0 6px' }}>
            Re-engage repeat catering customers
          </h2>
          <p style={{ fontSize: 14, color: '#57534E', margin: 0, maxWidth: 700, lineHeight: 1.5 }}>
            Surface at-risk and dormant repeat customers, estimate recoverable revenue, and generate operator-ready outreach before you send anything.
          </p>
        </div>
        <button
          onClick={openBuilder}
          style={primaryButtonStyle}
        >
          Re-engage Customers
        </button>
      </div>

      {error ? <div style={errorBannerStyle}>{error}</div> : null}
      {success ? <div style={successBannerStyle}>{success}</div> : null}

      {actionableSummary ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))',
            gap: 12,
            marginBottom: 20,
          }}
        >
          <MetricCard
            label="At-risk repeat customers"
            value={String(actionableSummary.atRiskCount)}
            sub={
              actionableSummary.atRiskCount > 0
                ? `${formatCurrency(summary!.segments.at_risk.potentialRevenueCents)} in reachable revenue`
                : 'No immediate reactivation needed'
            }
          />
          <MetricCard
            label="Dormant repeat customers"
            value={String(actionableSummary.dormantCount)}
            sub={
              actionableSummary.dormantCount > 0
                ? `${formatCurrency(summary!.segments.dormant.potentialRevenueCents)} in recoverable revenue`
                : 'No dormant accounts right now'
            }
          />
          <MetricCard
            label="Potential revenue"
            value={formatCurrency(actionableSummary.potentialRevenueCents)}
            sub={`${summary!.repeatCustomerCount} repeat customers total`}
          />
        </div>
      ) : null}

      {reorderOpportunities.length > 0 ? (
        <div
          style={{
            border: '1px solid #E7E5E4',
            borderRadius: 12,
            padding: isMobile ? 16 : 18,
            marginBottom: 20,
            background: '#FFFBEB',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
            <div>
              <div style={eyebrowStyle}>Smart alerts</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#1C1917' }}>
                Customers likely to reorder soon
              </div>
            </div>
            <div style={{ fontSize: 12, color: '#78716C' }}>
              {reorderOpportunities.length} likely reorder opportunities
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {reorderOpportunities.map((opportunity) => (
              <div
                key={opportunity.customerId}
                style={{
                  border: '1px solid #FDE68A',
                  borderRadius: 10,
                  background: '#FFFFFF',
                  padding: '12px 14px',
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.5fr) auto',
                  gap: 12,
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 4 }}>
                    <span style={pillStyle}>{opportunity.confidence === 'high' ? 'Likely this week' : 'Due soon'}</span>
                    <span style={subtlePillStyle}>{segmentLabel(opportunity.segment)}</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1C1917' }}>
                    {opportunity.name}
                  </div>
                  <div style={{ fontSize: 12, color: '#57534E', marginTop: 4, lineHeight: 1.5 }}>
                    Orders about every {opportunity.cadenceDays} days. Last order was {opportunity.daysSinceLastOrder} days ago.
                    {` `}
                    Last average order value: {formatCurrency(opportunity.averageOrderValueCents)}.
                  </div>
                </div>
                <button
                  onClick={() => openReorderReminder(opportunity)}
                  style={primaryButtonStyle}
                >
                  Send reorder reminder
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {isBuilderOpen ? (
        <div
          style={{
            border: '1px solid #E7E5E4',
            borderRadius: 12,
            padding: isMobile ? 16 : 20,
            marginBottom: 20,
            background: '#FCFBF8',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12 }}>
            <div>
              <div style={eyebrowStyle}>Campaign builder</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1C1917', margin: '4px 0 4px' }}>
                {campaignKind === 'reorder_reminder'
                  ? 'Build a reorder reminder'
                  : 'Build a repeat-order reactivation campaign'}
              </h3>
              <p style={{ fontSize: 13, color: '#78716C', margin: 0 }}>
                {campaignKind === 'reorder_reminder'
                  ? 'Start from a likely reorder account, review the target list, then generate a timely reminder before you send.'
                  : 'Choose the segment, review the target list, then generate outreach before you save or send.'}
              </p>
            </div>
            <button onClick={closeBuilder} style={secondaryButtonStyle}>
              Close
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            {builderSegments.map((segment) => {
              const isActive = selectedSegment === segment;
              const count = segment === 'frequent'
                ? reorderOpportunities.filter((opportunity) => opportunity.segment === 'frequent').length
                : (summary?.segments[segment].count ?? 0);
              return (
                <button
                  key={segment}
                  onClick={() => setSelectedSegment(segment)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: isActive ? '1px solid #1C1917' : '1px solid #E7E5E4',
                    background: isActive ? '#1C1917' : '#FFFFFF',
                    color: isActive ? '#FFFFFF' : '#1C1917',
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  {segmentLabel(segment)} ({count})
                </button>
              );
            })}
          </div>

          <div style={{ fontSize: 13, color: '#78716C', marginBottom: 16 }}>
            {SEGMENT_COPY[selectedSegment].description}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.25fr) minmax(320px, 0.9fr)',
              gap: 16,
            }}
          >
            <div style={builderCardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 12 }}>
                <div>
                  <div style={sectionLabelStyle}>Step 1. Review targets</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#1C1917' }}>
                    {SEGMENT_COPY[selectedSegment].title}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button onClick={selectAll} style={secondaryButtonStyle} disabled={targetsLoading || targets.length === 0}>
                    Select all
                  </button>
                  <button onClick={clearSelection} style={secondaryButtonStyle} disabled={targetsLoading || selectedCustomerIds.length === 0}>
                    Clear
                  </button>
                </div>
              </div>

              {targetsLoading ? (
                <div style={{ color: '#78716C', fontSize: 14 }}>Loading repeat customers...</div>
              ) : targets.length === 0 ? (
                <div style={emptyStateStyle}>{SEGMENT_COPY[selectedSegment].empty}</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {targets.map((target) => {
                    const checked = selectedCustomerIds.includes(target.id);
                    return (
                      <label
                        key={target.id}
                        style={{
                          display: 'flex',
                          gap: 12,
                          alignItems: 'flex-start',
                          border: checked ? '1px solid #D4A853' : '1px solid #E7E5E4',
                          borderRadius: 10,
                          padding: '12px 14px',
                          background: checked ? '#FFFBEB' : '#FFFFFF',
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCustomer(target.id)}
                          style={{ marginTop: 2 }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                            <div>
                              <div style={{ fontSize: 15, fontWeight: 700, color: '#1C1917' }}>
                                {target.name}
                              </div>
                              <div style={{ fontSize: 12, color: '#78716C', marginTop: 2 }}>
                                {target.company || target.email}
                              </div>
                            </div>
                            <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
                              <div style={{ fontSize: 14, fontWeight: 700, color: '#1C1917' }}>
                                {formatCurrency(target.averageOrderValueCents)}
                              </div>
                              <div style={{ fontSize: 12, color: '#78716C' }}>Avg completed order</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8, fontSize: 12, color: '#57534E' }}>
                            <span>{target.orderCount} repeat orders</span>
                            <span>{target.daysSinceLastOrder} days since last order</span>
                            {target.phone ? <span>{target.phone}</span> : null}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={builderCardStyle}>
              <div style={{ marginBottom: 14 }}>
                <div style={sectionLabelStyle}>Step 2. Guide the message</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1C1917' }}>
                  Campaign notes
                </div>
              </div>

              <label style={fieldLabelStyle}>
                Campaign goal
                <textarea
                  value={goalNotes}
                  onChange={(event) => setGoalNotes(event.target.value)}
                  placeholder="Example: bring back office lunch customers before the next planning cycle."
                  rows={3}
                  style={textAreaStyle}
                />
              </label>

              <label style={fieldLabelStyle}>
                Tone notes
                <textarea
                  value={toneNotes}
                  onChange={(event) => setToneNotes(event.target.value)}
                  placeholder="Example: concise, warm, direct, no discount language."
                  rows={3}
                  style={textAreaStyle}
                />
              </label>

              <div style={{ marginBottom: 14, padding: '12px 14px', borderRadius: 10, background: '#F5F5F4' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#57534E', marginBottom: 6 }}>Selection snapshot</div>
                <div style={{ fontSize: 13, color: '#1C1917', lineHeight: 1.6 }}>
                  <div>{selectedCustomerIds.length} customers selected</div>
                  <div>{formatCurrency(selectedRevenueCents)} in reachable average revenue</div>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={generating || selectedCustomerIds.length === 0}
                style={{
                  ...primaryButtonStyle,
                  width: '100%',
                  justifyContent: 'center',
                  opacity: generating || selectedCustomerIds.length === 0 ? 0.65 : 1,
                  cursor: generating || selectedCustomerIds.length === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                {generating
                  ? 'Generating...'
                  : campaignKind === 'reorder_reminder'
                    ? 'Generate reorder reminder'
                    : 'Generate message'}
              </button>
            </div>
          </div>

          {generated ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) minmax(0, 0.85fr)',
                gap: 16,
                marginTop: 16,
              }}
            >
              <div style={builderCardStyle}>
                <div style={sectionLabelStyle}>Step 3. Preview email</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#57534E', marginBottom: 6 }}>Subject</div>
                <div style={previewBoxStyle}>{generated.generated.subject}</div>

                <div style={{ fontSize: 13, fontWeight: 700, color: '#57534E', margin: '14px 0 6px' }}>Body</div>
                <pre style={preStyle}>{generated.generated.emailBody}</pre>

                <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: 10, background: '#F5F5F4' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#57534E', marginBottom: 6 }}>AI timing suggestion</div>
                  <div style={{ fontSize: 13, color: '#1C1917', lineHeight: 1.6 }}>
                    <div><strong>Best window:</strong> {generated.generated.timingGuidance.recommendedSendWindow}</div>
                    <div><strong>Tone:</strong> {generated.generated.timingGuidance.tone}</div>
                    <div style={{ marginTop: 6 }}>{generated.generated.timingGuidance.rationale}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
                  <button
                    onClick={() => void handleCampaignAction('draft', 'email')}
                    disabled={submitting}
                    style={secondaryButtonStyle}
                  >
                    Save draft
                  </button>
                  <button
                    onClick={() => void handleCampaignAction('sent', 'email')}
                    disabled={submitting}
                    style={primaryButtonStyle}
                  >
                    {submitting ? 'Sending...' : 'Send email campaign'}
                  </button>
                </div>
              </div>

              <div style={builderCardStyle}>
                <div style={sectionLabelStyle}>Step 4. SMS copy</div>
                <div style={{ fontSize: 13, color: '#78716C', marginBottom: 10 }}>
                  SMS stays manual in Phase 1. Copy the text, then send it through your normal workflow.
                </div>
                <pre style={preStyle}>{generated.generated.smsBody}</pre>

                <button
                  onClick={() => void handleCampaignAction('copied', 'sms_copy')}
                  disabled={submitting}
                  style={{ ...primaryButtonStyle, marginTop: 14 }}
                >
                  {submitting ? 'Saving...' : 'Copy SMS text'}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div style={historyCardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 12 }}>
          <div>
            <div style={sectionLabelStyle}>Recent campaign activity</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1C1917' }}>AI sales history</div>
          </div>
          <div style={{ fontSize: 12, color: '#78716C' }}>Last 5 campaigns</div>
        </div>

        {campaigns.length === 0 ? (
          <div style={emptyStateStyle}>
            No reactivation campaigns yet. Generate your first one from the dashboard.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                style={{
                  border: '1px solid #E7E5E4',
                  borderRadius: 10,
                  padding: '12px 14px',
                  background: '#FFFFFF',
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.5fr) auto auto',
                  gap: 12,
                  alignItems: 'center',
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 4 }}>
                    <span style={pillStyle}>{segmentLabel(campaign.segment)}</span>
                    <span style={subtlePillStyle}>{campaign.channel === 'email' ? 'Email' : 'SMS copy'}</span>
                    <span style={subtlePillStyle}>{campaign.status}</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1C1917', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {campaign.generatedSubject || 'SMS reactivation campaign'}
                  </div>
                  <div style={{ fontSize: 12, color: '#78716C', marginTop: 4 }}>
                    {campaignStatusLabel(campaign)} • {formatCurrency(campaign.estimatedRevenueCents)} estimated revenue
                  </div>
                </div>
                <div style={{ fontSize: 12, color: '#57534E' }}>
                  {campaign.selectedTargetCount} targets
                </div>
                <div style={{ fontSize: 12, color: '#78716C', textAlign: isMobile ? 'left' : 'right' }}>
                  {formatDate(campaign.sentAt || campaign.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div
      style={{
        border: '1px solid #E7E5E4',
        borderRadius: 12,
        padding: '16px 18px',
        background: '#FFFFFF',
      }}
    >
      <div style={sectionLabelStyle}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: '#1C1917', lineHeight: 1.15 }}>{value}</div>
      <div style={{ fontSize: 12, color: '#78716C', marginTop: 6 }}>{sub}</div>
    </div>
  );
}

const panelStyle: CSSProperties = {
  border: '1px solid #E7E5E4',
  borderRadius: 14,
  background: '#FFFFFF',
  padding: 20,
  marginBottom: 24,
};

const builderCardStyle: CSSProperties = {
  border: '1px solid #E7E5E4',
  borderRadius: 12,
  padding: 16,
  background: '#FFFFFF',
};

const historyCardStyle: CSSProperties = {
  borderTop: '1px solid #E7E5E4',
  paddingTop: 18,
};

const eyebrowStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: '#A16207',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
};

const sectionLabelStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: '#78716C',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: 6,
};

const fieldLabelStyle: CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: '#1C1917',
  marginBottom: 12,
};

const textAreaStyle: CSSProperties = {
  width: '100%',
  marginTop: 6,
  borderRadius: 10,
  border: '1px solid #D6D3D1',
  padding: '10px 12px',
  fontSize: 13,
  color: '#1C1917',
  resize: 'vertical',
  background: '#FFFFFF',
  minHeight: 78,
};

const primaryButtonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '10px 16px',
  borderRadius: 10,
  border: 'none',
  background: '#1C1917',
  color: '#FFFFFF',
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
};

const secondaryButtonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid #D6D3D1',
  background: '#FFFFFF',
  color: '#1C1917',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
};

const errorBannerStyle: CSSProperties = {
  border: '1px solid #FCA5A5',
  borderRadius: 10,
  padding: '12px 14px',
  marginBottom: 16,
  background: '#FEF2F2',
  color: '#B91C1C',
  fontSize: 13,
};

const successBannerStyle: CSSProperties = {
  border: '1px solid #86EFAC',
  borderRadius: 10,
  padding: '12px 14px',
  marginBottom: 16,
  background: '#F0FDF4',
  color: '#166534',
  fontSize: 13,
};

const emptyStateStyle: CSSProperties = {
  border: '1px dashed #D6D3D1',
  borderRadius: 10,
  padding: '18px 16px',
  background: '#FAFAF9',
  color: '#78716C',
  fontSize: 13,
};

const previewBoxStyle: CSSProperties = {
  border: '1px solid #E7E5E4',
  borderRadius: 10,
  padding: '12px 14px',
  background: '#FAFAF9',
  fontSize: 14,
  color: '#1C1917',
};

const preStyle: CSSProperties = {
  whiteSpace: 'pre-wrap',
  margin: 0,
  border: '1px solid #E7E5E4',
  borderRadius: 10,
  padding: '12px 14px',
  background: '#FAFAF9',
  fontSize: 13,
  lineHeight: 1.6,
  color: '#1C1917',
  fontFamily: 'inherit',
};

const pillStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '3px 8px',
  borderRadius: 999,
  background: '#FEF3C7',
  color: '#92400E',
  fontSize: 11,
  fontWeight: 700,
};

const subtlePillStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '3px 8px',
  borderRadius: 999,
  background: '#F5F5F4',
  color: '#57534E',
  fontSize: 11,
  fontWeight: 600,
};
