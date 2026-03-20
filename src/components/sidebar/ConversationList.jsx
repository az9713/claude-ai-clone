import ConversationItem from './ConversationItem.jsx'

const GROUP_LABELS = {
  pinned: 'Pinned',
  today: 'Today',
  yesterday: 'Yesterday',
  last7days: 'Previous 7 Days',
  last30days: 'Previous 30 Days',
  older: 'Older',
}

const GROUP_ORDER = ['pinned', 'today', 'yesterday', 'last7days', 'last30days', 'older']

export default function ConversationList({
  grouped,
  activeConversation,
  onSelect,
  onDelete,
  onRename,
  onPin,
  onArchive,
  onDuplicate,
  onShare,
  onExport,
}) {
  const hasAny = GROUP_ORDER.some(key => grouped[key]?.length > 0)

  if (!hasAny) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
          No conversations yet. Start a new chat!
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-1 pr-1" style={{ scrollbarWidth: 'thin' }}>
      {GROUP_ORDER.map(groupKey => {
        const items = grouped[groupKey]
        if (!items || items.length === 0) return null
        return (
          <div key={groupKey}>
            <div
              className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider"
              style={{ color: 'var(--text-secondary)' }}
            >
              {GROUP_LABELS[groupKey]}
            </div>
            {items.map(conv => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={activeConversation?.id === conv.id}
                onSelect={onSelect}
                onDelete={onDelete}
                onRename={onRename}
                onPin={onPin}
                onArchive={onArchive}
                onDuplicate={onDuplicate}
                onShare={onShare}
                onExport={onExport}
              />
            ))}
          </div>
        )
      })}
    </div>
  )
}
