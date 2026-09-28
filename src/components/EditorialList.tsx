import type { ReactNode } from 'react'

import OrderArrows from './OrderArrows'
import { movedIds } from '../lib/reorder'
import { useArmed } from '../lib/useArmed'
import ui from '../styles/ui.module.css'
import css from '../pages/Editorial.module.css'

type Row = { id: number; isPublished: boolean; displayOrder: number }

type Props<T extends Row> = {
  rows: T[]
  loaded: boolean
  columns: [string, string]
  primary: (row: T) => ReactNode
  secondary: (row: T) => ReactNode
  aside: (row: T) => ReactNode
  label: (row: T) => string
  emptyText: string
  onEdit: (row: T) => void
  onToggle: (id: number) => void
  onRemove: (id: number) => void
  onReorder: (ids: number[]) => void
}

/** The table shared by testimonials, brands and FAQs: order arrows, Live/Draft, Edit, two-step delete. */
export default function EditorialList<T extends Row>({ rows, loaded, columns, primary, secondary, aside, label, emptyText, onEdit, onToggle, onRemove, onReorder }: Props<T>) {
  const { armedId, confirm } = useArmed()
  return (
    <div className={ui.panel}>
      <div className={css.scroll}>
        <div className={css.table}>
          <div className={css.head}>
            <div className={css.th}>{columns[0]}</div>
            <div className={css.th}>{columns[1]}</div>
            <div className={css.th}>Order</div>
            <div className={css.th}>Status</div>
            <div className={css.th}>Actions</div>
          </div>

          {rows.map((row, index) => (
            <div key={row.id} className={css.row}>
              <div>
                <div className={css.name}>{primary(row)}</div>
                <div className={css.sub}>{secondary(row)}</div>
              </div>
              <div className={css.cell}>{aside(row)}</div>
              <OrderArrows index={index} count={rows.length} onMove={(from, to) => onReorder(movedIds(rows, from, to))} />
              <button type="button" className={row.isPublished ? css.live : css.draft} onClick={() => onToggle(row.id)} aria-label={`${row.isPublished ? 'Unpublish' : 'Publish'} ${label(row)}`}>
                {row.isPublished ? 'Live' : 'Draft'}
              </button>
              <div className={css.actions}>
                <button type="button" className={css.edit} onClick={() => onEdit(row)}>
                  Edit
                </button>
                <button
                  type="button"
                  className={armedId === row.id ? `${css.delete} ${ui.armed}` : css.delete}
                  onClick={() => confirm(row.id, () => onRemove(row.id))}
                  aria-label={armedId === row.id ? `Confirm delete ${label(row)}` : `Delete ${label(row)}`}
                  title={armedId === row.id ? 'Click again to delete' : 'Delete'}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}

          {loaded && rows.length === 0 && <div className={ui.empty}>{emptyText}</div>}
        </div>
      </div>
    </div>
  )
}
